import { findFlatByPropId } from '../db/localDataStore.js' 

export const getPropertyRecommendations = async (req, res) => {
  try {
    const data = Array.isArray(req.body) ? req.body : (req.body ? [req.body] : [])
    const propertyList = []

    for (const object of data) {
      const PropertyID = object.PropertyID || object.PROP_ID

      // Find the property in the database based on PropertyID
      const property = await findFlatByPropId(PropertyID)

      // If the property exists, add the Similarity field
      if (property) {
        const new_data = {
          _id: property._id,
          LISTING_TITLE: property.LISTING_TITLE,
          PROPERTY_TYPE: property.PROPERTY_TYPE,
          PROP_ID: property.PROP_ID,
          PROJECT_LABEL: property.PROJECT_LABEL,
          SOCIETY_NAME: property.SOCIETY_NAME,
          location: property.location,
          CITY: property.CITY,
          BEDROOM_NUM: property.BEDROOM_NUM,
          AREA: property.AREA,
          PRICE: property.PRICE,
          Image: property.Image,
          Contact: property.Contact,
          FURNISH: property.FURNISH,
          AGE: property.AGE,
          amenity_luxury: property.amenity_luxury,
          FLOOR_NUM: property.FLOOR_NUM,
          BALCONY_NUM: property.BALCONY_NUM,
          Similarity: object.Similarity
        }
        propertyList.push(new_data)
      }
    }
    res.status(200).json(propertyList)
  } catch (error) {
    console.error('Error during prediction recommendation:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
