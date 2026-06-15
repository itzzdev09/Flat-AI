import express from 'express';
import { searchFlats } from '../Controllers/searchController.js';

const router = express.Router();


router.post('/', searchFlats);

export default router;
