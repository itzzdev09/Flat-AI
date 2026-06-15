import { filterByLocation } from '../Components/Analysis/analysisHelpers';
import { matchesLocationQuery } from './propertyUtils';

describe('location filtering', () => {
  test('matches grouped localities by canonical location', () => {
    expect(matchesLocationQuery('New Town Action Area 1', 'New Town')).toBe(true);
    expect(matchesLocationQuery('Rajarhat Main Road', 'Rajarhat')).toBe(true);
  });

  test('filters analysis data by location using shared matcher', () => {
    const data = [
      { location: 'New Town Action Area 1', PRICE: 1.1 },
      { location: 'Rajarhat Main Road', PRICE: 0.9 },
      { location: 'Bansdroni', PRICE: 0.7 },
    ];

    const filtered = filterByLocation(data, 'New Town');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].location).toBe('New Town Action Area 1');
  });
});
