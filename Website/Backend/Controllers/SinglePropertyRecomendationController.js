
import { findFlatByPropId } from '../db/localDataStore.js'

export const Recommendation = async (req, res) => {
  try {
    const IDList = req.body 
    const dataList = []

    if (IDList && IDList.length > 0) {
      for (const id of IDList) {
        const data = await findFlatByPropId(id)
        if (data) {
          dataList.push(data)
        }
      }
      return res.status(200).json(dataList) 
    } else {
      return res.status(400).json({ message: 'No IDs provided' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}
