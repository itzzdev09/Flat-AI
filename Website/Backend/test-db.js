import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

dotenv.config({ path: envPath });

const mongoUri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI || process.env.MONGO_URI;
console.log('Using MongoDB URI:', mongoUri);

async function run() {
  if (!mongoUri) {
    console.log('No MongoDB URI found in Backend/.env!');
    process.exit(1);
  }
  
  console.time('DB Connection');
  try {
    await mongoose.connect(mongoUri, {
      dbName: 'realestate',
      serverSelectionTimeoutMS: 5000,
    });
    console.timeEnd('DB Connection');
    console.log('Connected successfully!');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check Flat_Data count
    if (collections.some(c => c.name === 'Flat_Data')) {
      const count = await mongoose.connection.db.collection('Flat_Data').countDocuments();
      console.log('Flat_Data count:', count);
      
      const distinctTypes = await mongoose.connection.db.collection('Flat_Data').distinct('PROPERTY_TYPE');
      console.log('Distinct PROPERTY_TYPE in Mongo:', distinctTypes);
      
      const sample = await mongoose.connection.db.collection('Flat_Data').findOne();
      console.log('Sample document:', JSON.stringify(sample, null, 2));
    } else {
      console.log('Flat_Data collection NOT found!');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
