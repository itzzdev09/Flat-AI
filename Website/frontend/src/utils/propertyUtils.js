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

const INTERIOR_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=1200&q=80',
];

const INVALID_IMAGE_PATTERNS = [/via\.placeholder\.com/i];

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
  const seed = flat._id || flat.PROP_ID || flat.location || flat.SOCIETY_NAME || '';
  return INTERIOR_FALLBACK_IMAGES[stringToIndex(seed) % INTERIOR_FALLBACK_IMAGES.length];
};

export const getPropertyImage = (flat = {}) => {
  const image = String(flat.Image || '').trim();
  if (!image) return getFallbackPropertyImage(flat);
  if (INVALID_IMAGE_PATTERNS.some((pattern) => pattern.test(image))) return getFallbackPropertyImage(flat);
  return image;
};
