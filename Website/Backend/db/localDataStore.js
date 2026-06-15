import mongoose from 'mongoose';
import path from 'path';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import FlatData from './FlatModel.js';
import { matchesLocationQuery } from '../utils/location.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_PICKLE_PATH = path.resolve(__dirname, '../../ml/pkl/prediction_df.pkl');
const ANALYSIS_FIELDS = [
  'BEDROOM_NUM',
  'location',
  'CITY',
  'AREA',
  'Price_per_sqft',
  'PRICE',
  'AGE',
  'FURNISH',
  'amenity_luxury',
  'FLOOR_NUM',
  'TOTAL_FLOOR',
  'Facing_Direction',
  'LATITUDE',
  'LONGITUDE',
];

const isMongoReady = () => mongoose.connection.readyState === 1;
let fallbackFlatCache = null;

const loadFallbackFlatData = async () => {
  if (fallbackFlatCache) {
    return fallbackFlatCache;
  }

  const python = process.env.PYTHON || 'python';
  const script = [
    'import math',
    'import pandas as pd, json, sys',
    `df = pd.read_pickle(r"""${FALLBACK_PICKLE_PATH}""")`,
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

  const raw = await new Promise((resolve, reject) => {
    execFile(python, ['-c', script], { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout);
    });
  });

  const parsed = JSON.parse(raw);
  fallbackFlatCache = parsed.map((item, index) => finalizeFlat(normalizeFlat(item, index)));
  return fallbackFlatCache;
};

const toTitleCase = (value = '') => (
  String(value).toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
);

const toProjectLabel = (value = '') => {
  const normalized = toTitleCase(value).trim();
  if (!normalized || normalized === 'Unknown' || normalized === 'On Request' || normalized === 'Not Applicable') {
    return '';
  }
  return normalized;
};

const buildListingTitle = (item) => {
  const bedrooms = item.BEDROOM_NUM ? `${item.BEDROOM_NUM} BHK` : null;
  const propertyType = 'Local Flat';
  const area = item.AREA ? `${item.AREA} sqft` : null;
  const location = item.location ? `in ${item.location}` : null;

  return [bedrooms, propertyType, area, location].filter(Boolean).join(' ');
};

const normalizeFlat = (item, index = 0) => ({
  ...item,
  _id: item._id || item.PROP_ID || String(index + 1),
  SOCIETY_NAME: toTitleCase(item.SOCIETY_NAME),
  PROPERTY_TYPE: 'Local Flat',
  CITY: toTitleCase(item.CITY),
  location: toTitleCase(item.location),
  PROJECT_LABEL: toProjectLabel(item.SOCIETY_NAME),
  LISTING_TITLE: '',
});

const finalizeFlat = (item) => ({
  ...item,
  LISTING_TITLE: buildListingTitle(item),
});

const fingerprintFlat = (item) => [
  item.SOCIETY_NAME,
  item.location,
  item.BEDROOM_NUM,
  item.AREA,
  item.PRICE,
].map((value) => String(value ?? '').toLowerCase()).join('|');

const dedupeFlats = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const fingerprint = fingerprintFlat(item);
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint);
    return true;
  });
};

const matchesArrayFilter = (value, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return filterValue.some((item) => String(item) === String(value));
};

const matchesPropertyTypeFilter = (value, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  const normalizedValue = String(value || '').toLowerCase();
  return filterValue.some((item) => normalizedValue === String(item).toLowerCase());
};

export const getTotalFlatsCount = async () => {
  if (isMongoReady()) {
    return await FlatData.countDocuments();
  }
  const fallbackData = await loadFallbackFlatData();
  return fallbackData.length;
};

export const getPagedFlats = async (page = 1, limit = 2) => {
  const startIndex = (page - 1) * limit;
  if (isMongoReady()) {
    const mongoData = await FlatData.find().skip(startIndex).limit(limit).lean();
    return mongoData.map((item, index) => finalizeFlat(normalizeFlat(item, startIndex + index)));
  }

  const fallbackData = await loadFallbackFlatData();
  return fallbackData.slice(startIndex, startIndex + limit);
};

export const searchLocalOrMongoFlats = async (query) => {
  if (isMongoReady()) {
    const mongoQuery = { ...query };
    delete mongoQuery.location;

    if (Array.isArray(mongoQuery.BEDROOM_NUM)) {
      mongoQuery.BEDROOM_NUM = { $in: mongoQuery.BEDROOM_NUM };
    }

    if (Array.isArray(mongoQuery.PROPERTY_TYPE)) {
      mongoQuery.PROPERTY_TYPE = { $in: mongoQuery.PROPERTY_TYPE };
    }

    const results = (await FlatData.find(mongoQuery).lean()).map((item, index) => finalizeFlat(normalizeFlat(item, index)));

    if (!query.location) {
      return dedupeFlats(results);
    }

    return dedupeFlats(results.filter((item) => matchesLocationQuery(item.location, query.location)));
  }

  const fallbackData = await loadFallbackFlatData();
  const filtered = fallbackData.filter((item) => (
    matchesArrayFilter(item.BEDROOM_NUM, query.BEDROOM_NUM)
    && matchesPropertyTypeFilter(item.PROPERTY_TYPE, query.PROPERTY_TYPE)
    && (!query.location || matchesLocationQuery(item.location, query.location))
  ));
  return dedupeFlats(filtered);
};

export const findFlatById = async (id) => {
  if (isMongoReady() && mongoose.Types.ObjectId.isValid(id)) {
    const mongoData = await FlatData.findById(id).lean();
    if (mongoData) return finalizeFlat(normalizeFlat(mongoData));
  }

  const fallbackData = await loadFallbackFlatData();
  return fallbackData.find((item) => String(item._id) === String(id) || String(item.PROP_ID) === String(id)) || null;
};

export const findFlatByPropId = async (propId) => {
  if (isMongoReady()) {
    const mongoData = await FlatData.findOne({ PROP_ID: propId }).lean();
    return mongoData ? finalizeFlat(normalizeFlat(mongoData)) : null;
  }

  const fallbackData = await loadFallbackFlatData();
  return fallbackData.find((item) => String(item.PROP_ID) === String(propId)) || null;
};

export const getFilteredFlats = async () => {
  const fields = [
    'BEDROOM_NUM',
    'location',
    'CITY',
    'AREA',
    'Price_per_sqft',
    'PRICE',
    'AGE',
    'FURNISH',
    'amenity_luxury',
    'FLOOR_NUM',
    'TOTAL_FLOOR',
    'Facing_Direction',
    'LATITUDE',
    'LONGITUDE',
  ];

  if (isMongoReady()) {
    return dedupeFlats((await FlatData.find({}, Object.fromEntries(fields.map((field) => [field, 1]))).lean()).map((item, index) => finalizeFlat(normalizeFlat(item, index))));
  }

  const fallbackData = await loadFallbackFlatData();
  return dedupeFlats(
    fallbackData.map((item, index) => finalizeFlat(normalizeFlat(
      Object.fromEntries(ANALYSIS_FIELDS.map((field) => [field, item[field]])),
      index
    )))
  );
};
