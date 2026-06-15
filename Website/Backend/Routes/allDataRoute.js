import express from 'express';
import  {allDataController}  from '../Controllers/allDataController.js';

const router = express.Router();


router.post('/:page', allDataController);

export default router;
