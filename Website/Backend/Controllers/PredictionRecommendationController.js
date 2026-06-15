import { findFlatByPropId } from '../db/localDataStore.js' 

export const getPropertyRecommendations = async (req, res) => {
  try {
    const data = req.body
    const propertyList = []

    for (const object of data) {
      const PropertyID = object.PropertyID

      // Find the property in the database based on PropertyID
      const property = await findFlatByPropId(PropertyID)

      // If the property exists, add the Similarity field
      if (property) {
        const new_data = {
          _id: property._id,
          PROPERTY_TYPE: property.PROPERTY_TYPE,
          PROP_ID: property.PROP_ID,
          location: property.location,
          BEDROOM_NUM: property.BEDROOM_NUM,
          AREA: property.AREA,
          PRICE: property.PRICE,
          Image: property.Image,
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
