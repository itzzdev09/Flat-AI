const LOCATION_ALIASES = {
  rajathat: 'rajarhat',
  'rajarhat kolkata east': 'rajarhat',
  'rajarhat chowmatha kol': 'rajarhat',
  'rajarhat main road': 'rajarhat',
  'rajathat chowmatha': 'rajarhat',
  'new town action area 1a': 'new town',
  'new town action area 1b': 'new town',
  'new town action area 1c': 'new town',
  'new town action area 1d': 'new town',
  'new town action area 2b': 'new town',
  'new town action area 2c': 'new town',
  'new town action area 2d': 'new town',
  'new town action area iid': 'new town',
  'new town actuon area 2d': 'new town',
  'aa 1d newtown': 'new town',
  'action area 1': 'new town',
  'action area 2': 'new town',
  'action area 3': 'new town',
};

const LOCAL_IMAGES = [
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1598977123418-45f04b615e07?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1606149059549-6042addafc5a?auto=format&fit=crop&w=1200&q=80'
];

export const normalizeLocationKey = (value = '') => {
  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  return LOCATION_ALIASES[normalized] || normalized;
};

export const hasExactLocationMatch = (locations = [], query = '') => {
  const queryKey = normalizeLocationKey(query);
  if (!queryKey) return false;
  return locations.some((location) => normalizeLocationKey(location) === queryKey);
};

export const matchesLocationQuery = (location, query, knownLocations = []) => {
  const rawLocation = String(location || '');
  const rawQuery = String(query || '').trim();

  if (!rawQuery) return true;

  const locationKey = normalizeLocationKey(rawLocation);
  const queryKey = normalizeLocationKey(rawQuery);
  if (!locationKey) return false;

  const queryAliases = [queryKey, LOCATION_ALIASES[queryKey]].filter(Boolean);
  const locationAliases = [locationKey, LOCATION_ALIASES[locationKey]].filter(Boolean);

  return queryAliases.some((queryAlias) => (
    locationAliases.some((locationAlias) => (
      locationAlias === queryAlias
      || locationAlias.includes(queryAlias)
      || queryAlias.includes(locationAlias)
    ))
  )) || rawLocation.toLowerCase().includes(rawQuery.toLowerCase());
};

export const getLocationSuggestions = (options = [], query = '') => {
  const value = String(query || '').trim();
  if (!value) return [];

  const queryKey = normalizeLocationKey(value);

  return [...new Set(options)]
    .filter((option) => {
      const optionKey = normalizeLocationKey(option);
      return optionKey.includes(queryKey) || String(option).toLowerCase().includes(value.toLowerCase());
    })
    .sort((first, second) => {
      const firstKey = normalizeLocationKey(first);
      const secondKey = normalizeLocationKey(second);

      const firstExact = firstKey === queryKey ? 0 : 1;
      const secondExact = secondKey === queryKey ? 0 : 1;
      if (firstExact !== secondExact) return firstExact - secondExact;

      const firstStarts = firstKey.startsWith(queryKey) ? 0 : 1;
      const secondStarts = secondKey.startsWith(queryKey) ? 0 : 1;
      if (firstStarts !== secondStarts) return firstStarts - secondStarts;

      return String(first).localeCompare(String(second));
    });
};

const stringToIndex = (value = '') => (
  String(value)
    .split('')
    .reduce((sum, character) => sum + character.charCodeAt(0), 0)
);

export const getFallbackPropertyImage = (flat = {}) => {
  const location = String(flat.location || '').toLowerCase();

  if (location.includes('garia')) {
    return LOCAL_IMAGES[0];
  } else if (location.includes('alipore')) {
    return LOCAL_IMAGES[1];
  } else if (location.includes('new town') || location.includes('newtown') || location.includes('action area')) {
    return LOCAL_IMAGES[2];
  } else if (location.includes('rajarhat')) {
    return LOCAL_IMAGES[3];
  }

  const seed = flat._id || flat.PROP_ID || flat.location || flat.SOCIETY_NAME || '';
  return LOCAL_IMAGES[stringToIndex(seed) % LOCAL_IMAGES.length];
};

export const getPropertyImage = (flat = {}) => {
  const image = String(flat.Image || '').trim();
  if (image && !/via\.placeholder\.com/i.test(image) && !/pixabay\.com/i.test(image)) {
    return image;
  }

  const seed = flat._id || flat.PROP_ID || flat.location || flat.SOCIETY_NAME || '';
  const images = [
    'https://cdn.pixabay.com/photo/2017/06/16/13/40/new-home-2409165_960_720.jpg',
    'https://cdn.pixabay.com/photo/2015/09/27/22/36/house-961401_1280.jpg'
  ];
  return images[stringToIndex(seed) % images.length];
};
