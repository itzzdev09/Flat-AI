
import express from 'express'
import { Recommendation } from '../Controllers/SinglePropertyRecommendationController.js';

const router = express.Router()

router.post('/:id', Recommendation)

export default router
