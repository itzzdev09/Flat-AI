import { searchLocalOrMongoFlats } from '../db/localDataStore.js'

// This endpoint keeps the prediction page stable by doing the scoring server-side.
// If Django is available later, the same response shape can still be mirrored there,
// but the website no longer depends on the browser reaching Django directly.
const AGE_ALIASES = {
  'relatively new property': 'Relatively New',
  'relatively new': 'Relatively New',
  'new property': 'New Property',
  'moderately old': 'Moderately Old',
  'old property': 'Old Property',
}

const FURNISH_ALIASES = {
  'semi-furnished': 'Semi Furnished',
  'semi furnished': 'Semi Furnished',
  'fully furnished': 'Fully furnished',
  'luxury furnished': 'Luxury furnished',
  'unfurnished': 'Unfurnished',
}

const AMENITY_FACTORS = {
  Low: 0.94,
  Medium: 1.0,
  High: 1.08,
}

const FURNISH_FACTORS = {
  Unfurnished: 0.95,
  'Semi Furnished': 1.0,
  'Luxury furnished': 1.09,
  'Fully furnished': 1.06,
}

const AGE_FACTORS = {
  'New Property': 1.08,
  'Relatively New': 1.03,
  'Moderately Old': 0.97,
  'Old Property': 0.92,
}

const FLOOR_FACTORS = {
  'Low Floor': 0.98,
  'Mid Floor': 1.0,
  'High Floor': 1.03,
}

const asFloat = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeString = (value) => String(value ?? '').trim()

const normalizeAge = (value) => {
  const normalized = normalizeString(value)
  return AGE_ALIASES[normalized.toLowerCase()] || normalized
}

const normalizeFurnish = (value) => {
  const normalized = normalizeString(value)
  return FURNISH_ALIASES[normalized.toLowerCase()] || normalized
}

const floorBandFromNumber = (value) => {
  const floorNum = asFloat(value, 0)
  if (floorNum <= 4) return 'Low Floor'
  if (floorNum <= 10) return 'Mid Floor'
  return 'High Floor'
}

const normalizeQuery = (data) => ({
  location: normalizeString(data.location),
  bedroom: asFloat(data.bedroom),
  balcony: asFloat(data.balcony),
  area: asFloat(data.area),
  age: normalizeAge(data.age),
  furnish: normalizeFurnish(data.furnish),
  amenity: normalizeString(data.amenity),
  floor: normalizeString(data.floor),
})

const comparableScore = (source, item) => {
  let score = 0

  if (normalizeString(item.location).toLowerCase() === source.location.toLowerCase()) score += 3.5
  if (asFloat(item.BEDROOM_NUM) === source.bedroom) score += 2.4
  if (normalizeFurnish(item.FURNISH) === source.furnish) score += 1.2
  if (normalizeAge(item.AGE) === source.age) score += 1.0
  if (normalizeString(item.amenity_luxury) === source.amenity) score += 0.9
  if (floorBandFromNumber(item.FLOOR_NUM) === source.floor) score += 0.7
  if (asFloat(item.BALCONY_NUM) === source.balcony) score += 0.5

  const areaGapRatio = Math.abs(asFloat(item.AREA) - source.area) / Math.max(source.area, 1)
  score += Math.max(0, 2.0 - (areaGapRatio * 2.4))

  return score
}

const similarityScore = (source, target) => {
  let score = 0

  if (normalizeString(source.location) === normalizeString(target.location)) score += 0.35
  if (asFloat(source.BEDROOM_NUM) === asFloat(target.BEDROOM_NUM)) score += 0.2
  if (source.AGE === target.AGE) score += 0.1
  if (source.FURNISH === target.FURNISH) score += 0.1
  if (source.amenity_luxury === target.amenity_luxury) score += 0.1
  if (source.FLOOR_NUM === target.FLOOR_NUM) score += 0.05
  if (asFloat(source.BALCONY_NUM) === asFloat(target.BALCONY_NUM)) score += 0.03

  const areaGap = Math.abs(asFloat(source.AREA) - asFloat(target.AREA))
  const priceGap = Math.abs(asFloat(source.PRICE) - asFloat(target.PRICE))
  score += Math.max(0, 0.1 - (areaGap / 7000))
  score += Math.max(0, 0.07 - (priceGap / 8))

  return Math.min(score, 1)
}

const estimatePrice = (data, properties) => {
  const source = normalizeQuery(data)

  const scoredCandidates = []
  for (const item of properties) {
    const pricePerSqft = asFloat(item.Price_per_sqft)
    if (pricePerSqft <= 0) continue

    const score = comparableScore(source, item)
    if (score > 0) {
      scoredCandidates.push([score, item])
    }
  }

  scoredCandidates.sort((left, right) => right[0] - left[0])
  const topMatches = scoredCandidates.slice(0, 60)

  let basePricePerSqft = 5000
  if (topMatches.length > 0) {
    const weightedTotal = topMatches.reduce((sum, [score, item]) => sum + (score * asFloat(item.Price_per_sqft)), 0)
    const weightSum = topMatches.reduce((sum, [score]) => sum + score, 0)
    basePricePerSqft = weightedTotal / Math.max(weightSum, 1)
  } else {
    const pricePoints = properties
      .map((item) => asFloat(item.Price_per_sqft))
      .filter((value) => value > 0)

    if (pricePoints.length > 0) {
      basePricePerSqft = pricePoints.reduce((sum, value) => sum + value, 0) / pricePoints.length
    }
  }

  const bedroomFactor = 0.92 + Math.min(source.bedroom, 6) * 0.04
  const balconyFactor = 1 + Math.min(source.balcony, 4) * 0.01
  const amenityFactor = AMENITY_FACTORS[source.amenity] || 1.0
  const furnishFactor = FURNISH_FACTORS[source.furnish] || 1.0
  const ageFactor = AGE_FACTORS[source.age] || 1.0
  const floorFactor = FLOOR_FACTORS[source.floor] || 1.0

  const adjustedPricePerSqft = (
    basePricePerSqft
    * bedroomFactor
    * balconyFactor
    * amenityFactor
    * furnishFactor
    * ageFactor
    * floorFactor
  )

  const predictedRupees = source.area * adjustedPricePerSqft
  const predictedCrore = predictedRupees / 10000000
  return Math.round(Math.max(predictedCrore, 0.01) * 100) / 100
}

const hydrateRecommendation = (item, score) => ({
  _id: item._id,
  LISTING_TITLE: item.LISTING_TITLE,
  PROPERTY_TYPE: item.PROPERTY_TYPE,
  PROP_ID: item.PROP_ID,
  PROJECT_LABEL: item.PROJECT_LABEL,
  SOCIETY_NAME: item.SOCIETY_NAME,
  location: item.location,
  CITY: item.CITY,
  BEDROOM_NUM: item.BEDROOM_NUM,
  AREA: item.AREA,
  PRICE: item.PRICE,
  Image: item.Image,
  Contact: item.Contact,
  FURNISH: item.FURNISH,
  AGE: item.AGE,
  amenity_luxury: item.amenity_luxury,
  FLOOR_NUM: item.FLOOR_NUM,
  BALCONY_NUM: item.BALCONY_NUM,
  Similarity: `${(score * 100).toFixed(2)}`,
})

const buildRecommendations = (query, properties, topN = 10) => {
  const source = {
    location: query.location,
    BEDROOM_NUM: asFloat(query.bedroom),
    BALCONY_NUM: asFloat(query.balcony),
    AREA: asFloat(query.area),
    AGE: normalizeAge(query.age),
    FURNISH: normalizeFurnish(query.furnish),
    amenity_luxury: normalizeString(query.amenity),
    FLOOR_NUM: normalizeString(query.floor),
    PRICE: asFloat(query.PRICE),
  }

  const scored = properties
    .map((item) => [item, similarityScore(source, item)])
    .sort((left, right) => right[1] - left[1])
    .slice(0, topN)

  return scored.map(([item, score]) => hydrateRecommendation(item, score))
}

export const submitPrediction = async (req, res) => {
  try {
    const properties = await searchLocalOrMongoFlats({})
    if (!Array.isArray(properties) || properties.length === 0) {
      return res.status(500).json({ error: 'No property data available for prediction.' })
    }

    const query = {
      location: req.body?.location,
      bedroom: req.body?.bedroom,
      balcony: req.body?.balcony,
      area: req.body?.area,
      age: req.body?.age,
      furnish: req.body?.furnish,
      amenity: req.body?.amenity,
      floor: req.body?.floor,
    }

    const prediction = estimatePrice(query, properties)
    const recommendations = buildRecommendations({ ...query, PRICE: prediction }, properties)

    return res.status(200).json({
      prediction,
      recommendations,
    })
  } catch (error) {
    console.error('Error during local prediction:', error)
    return res.status(500).json({ error: error.message })
  }
}
