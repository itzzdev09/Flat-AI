import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import FlatData from '../db/FlatModel.js';
import { getMongoUri } from '../db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const dataPath = path.resolve(__dirname, '../../ml/pkl/prediction_df.pkl');
const mongoUri = getMongoUri();

const loadPropertiesFromPickle = async () => new Promise((resolve, reject) => {
  const python = process.env.PYTHON || 'python';
  const script = [
    'import math',
    'import pandas as pd, json, sys',
    `df = pd.read_pickle(r"""${dataPath}""")`,
    'def clean(value):',
    '    if isinstance(value, float) and math.isnan(value):',
    '        return None',
    '    if isinstance(value, dict):',
    '        return {key: clean(item) for key, item in value.items()}',
    '    if isinstance(value, list):',
    '        return [clean(item) for item in value]',
    '    return value',
    'records = [{key: clean(value) for key, value in row.items()} for row in df.to_dict(orient="records")]',
    'sys.stdout.write(json.dumps(records, ensure_ascii=False))',
  ].join('\n');

  execFile(python, ['-c', script], { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      reject(new Error(stderr || error.message));
      return;
    }

    try {
      resolve(JSON.parse(stdout));
    } catch (parseError) {
      reject(parseError);
    }
  });
});

const run = async () => {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set in Website/Backend/.env. Update it before running the seeder.');
  }

  const properties = await loadPropertiesFromPickle();

  await mongoose.connect(mongoUri);

  const collectionName = FlatData.collection.collectionName;
  console.log(`Connected to ${mongoUri}`);
  console.log(`Refreshing ${collectionName} with ${properties.length} listings...`);

  await FlatData.deleteMany({});
  await FlatData.insertMany(properties, { ordered: false });

  console.log(`Seed complete. ${await FlatData.countDocuments()} listings available in MongoDB.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Property seed failed:', error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
