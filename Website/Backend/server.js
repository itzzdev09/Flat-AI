import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import ClientDataRoute from './Routes/ClientDataRoute.js'
import allDataRoute from './Routes/allDataRoute.js'
import  singlePropertyRoute from './Routes/singlePropertyRoute.js'  
import authRoute from './Routes/authRoute.js'
import adminRoute from './Routes/adminRoute.js'
import { connectToDatabase } from './db/db.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import SinglePropertyRecommendationRoute from './Routes/SinglePropertyRecommendationRoute.js'
import PredictionRecommendationRoute from './Routes/PredictionRecommendationRouter.js'
import { getFilteredFlats } from './db/localDataStore.js'
import { createUser, findUserByEmail } from './db/userStore.js'
import { hashPassword } from './utils/password.js'
import { getMongoUri } from './db/db.js'



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })
const app = express()
// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(express.json())

// auth
app.use('/api/auth', authRoute)
app.use('/api/admin', adminRoute)

// get search result at home
app.use('/api/clientData', ClientDataRoute)

//get all data at home
app.use('/api/allData',allDataRoute )

// getting single property
app.use('/api/singleProperty',singlePropertyRoute )

// Getting recommendations in the single-property page
app.use('/api/recommendations', SinglePropertyRecommendationRoute);


// Prediction Recommendation
app.use('/api', PredictionRecommendationRoute);

// all filter data
app.get('/api/allfilteredData', async (req, res) => {
  
  try {
    const filteredData = await getFilteredFlats();

    // Send the filtered data as JSON response
    res.status(200).json(filteredData);
       
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});







// Start the server
const PORT = process.env.PORT || 4000
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@flat.ai').toLowerCase().trim()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'secret12'

const ensureBootstrapAdmin = async () => {
  const existingAdmin = await findUserByEmail(ADMIN_EMAIL);
  if (existingAdmin) return;

  await createUser({
    name: 'Flat AI Admin',
    email: ADMIN_EMAIL,
    passwordHash: hashPassword(ADMIN_PASSWORD),
    role: 'admin',
  });
}

const startServer = async () => {
  const mongoUri = getMongoUri();
  if (mongoUri && mongoUri.includes('127.0.0.1')) {
    console.warn('MongoDB is currently pointed at localhost. If you expect Atlas, set MONGODB_URI_ATLAS or replace MONGODB_URI in Website/Backend/.env.');
  }

  try {
    await connectToDatabase()
  } catch (error) {
    console.warn(`${error.message}. Starting server with pickle-backed property data fallback.`)
  }

  try {
    await ensureBootstrapAdmin()
  } catch (error) {
    console.warn(`Admin bootstrap skipped: ${error.message}`)
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

  server.on('error', (error) => {
    console.error(`Server failed to start on port ${PORT}: ${error.message}`)
    process.exit(1)
  })
}

startServer()
