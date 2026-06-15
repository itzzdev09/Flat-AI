import { getPagedFlats } from "../db/localDataStore.js";


export const allDataController = async (req, res) => {
    try {
  
      const page = parseInt(req.params.page) || 1
      const limit = 2
      const fetchData = await getPagedFlats(page, limit)
      res.status(200).json(fetchData)
    }
    catch (err) {
      console.log(err);
  
      res.status(500).json({ message: err.message });
    }
  }
  
