

import { findFlatById } from '../db/localDataStore.js';

export const singleProperty = async (req, res) => {
    try {
      const id = req.params.id
      const data = await findFlatById(id)
      return res.status(200).json(data)
    }
    catch (err) {
      console.log(err);
  
      res.status(500).json({ message: err.message });
    }
  }
