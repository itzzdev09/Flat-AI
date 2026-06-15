
import { searchLocalOrMongoFlats } from '../db/localDataStore.js';

const PROPERTY_TYPE_MAP = {
  'Flat/Apartment': 'Flat',
  'Farm House': 'Farm House',
  'House/Villa': 'House/Villa',
  'Residential Land': 'Residential Land',
};

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return [value];
};

const normalizeBedrooms = (value) => toArray(value)
  .map((item) => Number(item))
  .filter((item) => Number.isFinite(item) && item > 0);

const normalizePropertyTypes = (value) => toArray(value)
  .map((item) => PROPERTY_TYPE_MAP[item] || item)
  .filter(Boolean);

// Filtered data based on client query
export const searchFlats = async (req, res) => {
  const { location, bedroom, property } = req.body;

  // Build the query object based on provided filters
  const query = {};
  
  if (location) {
    query.location = location;
  }
  
  const bedroomValues = normalizeBedrooms(bedroom);
  if (bedroomValues.length > 0) {
    query.BEDROOM_NUM = bedroomValues.length === 1 ? bedroomValues[0] : bedroomValues;
  }

  const propertyTypes = normalizePropertyTypes(property);
  if (propertyTypes.length > 0) {
    query.PROPERTY_TYPE = propertyTypes.length === 1 ? propertyTypes[0] : propertyTypes;
  }

  try {
    const matchingFlats = await searchLocalOrMongoFlats(query);

    if (matchingFlats.length > 0) {
      res.json({
        message: 'Data retrieved successfully!',
        result: matchingFlats,
      });
    } else {
      res.json({
        message: `No data available for the selected criteria at the moment. Please check back later.`,
      });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Failed to fetch data.' });
  }
};
