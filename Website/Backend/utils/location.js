const LOCATION_ALIASES = {
  barrakpur: 'barrackpore',
  'new barrakpur': 'new barrackpore',
  rajathat: 'rajarhat',
  'rajarhat kolkata east': 'rajarhat',
  'rajarhat chowmatha kol': 'rajarhat',
  'rajarhat main road': 'rajarhat',
  'rajathat chowmatha': 'rajarhat',
  'aa 1d newtown': 'new town action area 1d',
  'new town action 3': 'new town action area 3',
  'new town actuon area 2d': 'new town action area 2d',
  'new town action area iid': 'new town action area iid',
  'action area 2 b': 'action area 2b',
  'desopriya park': 'deshapriya park',
  'deshpriya park': 'deshapriya park',
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

export const normalizeLocationKey = (value = '') => {
  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  return LOCATION_ALIASES[normalized] || normalized;
};

export const matchesLocationQuery = (location, query) => {
  const rawLocation = String(location || '');
  const rawQuery = String(query || '').trim();

  if (!rawQuery) return true;

  const locationKey = normalizeLocationKey(rawLocation);
  const queryKey = normalizeLocationKey(rawQuery);

  if (!locationKey) return false;

  return (
    locationKey === queryKey
    || locationKey.includes(queryKey)
    || queryKey.includes(locationKey)
    || rawLocation.toLowerCase().includes(rawQuery.toLowerCase())
  );
};
