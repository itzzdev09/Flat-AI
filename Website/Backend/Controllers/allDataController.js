import { getPagedFlats, getTotalFlatsCount } from "../db/localDataStore.js";


export const allDataController = async (req, res) => {
    try {
  
      const page = parseInt(req.params.page) || 1
      const limit = 12
      const flats = await getPagedFlats(page, limit)
      const total = await getTotalFlatsCount()
      res.status(200).json({ flats, total, limit })
    }
    catch (err) {
      console.log(err);
  
      res.status(500).json({ message: err.message });
    }
  }
