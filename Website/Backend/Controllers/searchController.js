
import { searchLocalOrMongoFlats } from '../db/localDataStore.js';


// Filtered data based on client query
export const searchFlats = async (req, res) => {
  const { location, bedroom, property } = req.body;

  let propertyType;

  switch (property) {
    case 'Flat/Apartment':
      propertyType = 'Flat';
      break;
    case 'Farm House':
      propertyType = 'Farm House';
      break;
    case 'House/Villa':
      propertyType = 'House/Villa';
      break;
    case 'Residential Land':
      propertyType = 'Residential Land';
      break;
    default:
      propertyType = null;
  }

  // Build the query object based on provided filters
  const query = {};
  
  if (location) {
    query.location = location;
  }
  
  if (bedroom) {
    query.BEDROOM_NUM = bedroom;
  }
  
  if (propertyType) {
    query.PROPERTY_TYPE = propertyType;
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
