import mongoose from 'mongoose';

const stripWrappingQuotes = (value) => String(value).trim().replace(/^['"]|['"]$/g, '');

const isPlaceholderUri = (value) => value.includes('<') || value.includes('>');

export const getMongoUri = () => (
  stripWrappingQuotes(
    process.env.MONGODB_URI_ATLAS
    || process.env.MONGODB_URI
    || process.env.MONGO_URI
    || ''
  )
);

export const connectToDatabase = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. MongoDB is required.');
  }

  if (isPlaceholderUri(mongoUri)) {
    throw new Error('MONGODB_URI looks like a placeholder value. Replace the <...> credentials in Website/Backend/.env with a real MongoDB connection string.');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      maxPoolSize: 10,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};
