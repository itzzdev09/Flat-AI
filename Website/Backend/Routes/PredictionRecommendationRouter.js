import express from 'express'
import { getPropertyRecommendations } from '../Controllers/PredictionRecommendationController.js'

const router = express.Router()

// POST request to /api/prediction-recommendation
router.post('/prediction-recommendation', getPropertyRecommendations)

export default router
