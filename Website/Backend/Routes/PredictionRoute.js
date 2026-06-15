import express from 'express'
import { submitPrediction } from '../Controllers/PredictionController.js'

const router = express.Router()

// The prediction page calls this route so the browser only has to talk to Node.
router.post('/submit', submitPrediction)

export default router
