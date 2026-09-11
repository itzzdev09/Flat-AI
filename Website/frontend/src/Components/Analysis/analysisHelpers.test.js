import {
  averageByField,
  countByField,
  formatCrore,
  normalizeCoordinates,
  toNumber,
} from './analysisHelpers';

describe('toNumber', () => {
  test.each([
    [42, 42],
    [0, 0],
    [-1.5, -1.5],
    ['42', 42],
    ['  42  ', 42],
    ['3.14', 3.14],
  ])('converts %p to %p', (input, expected) => {
    expect(toNumber(input)).toBe(expected);
  });

  // Regression: Number() coerces all of these to 0, so a missing field read as a
  // real zero and was counted instead of skipped.
  test.each([
    [null],
    [undefined],
    ['' ],
    ['   '],
    [[]],
    [false],
    [true],
    ['abc'],
    [{}],
    [NaN],
    [Infinity],
  ])('treats %p as missing', (input) => {
    expect(toNumber(input)).toBeNull();
  });
});

describe('formatCrore', () => {
  test('formats crore and lakh values', () => {
    expect(formatCrore(1.5)).toBe('Rs. 1.50 Cr');
    expect(formatCrore(0.45)).toBe('Rs. 45 Lakh');
  });

  test('reports missing values rather than showing Rs. 0', () => {
    expect(formatCrore(null)).toBe('N/A');
    expect(formatCrore('')).toBe('N/A');
    expect(formatCrore(undefined)).toBe('N/A');
  });
});

describe('averageByField', () => {
  test('skips missing metrics instead of averaging them as zero', () => {
    const data = [
      { location: 'Madhyamgram', PRICE: 1 },
      { location: 'Madhyamgram', PRICE: 2 },
      { location: 'Madhyamgram', PRICE: null },
      { location: 'Madhyamgram', PRICE: '' },
    ];

    // count is 2, not 4: the two missing prices are skipped, not averaged in.
    expect(averageByField(data, 'location', 'PRICE')).toEqual([
      { label: 'Madhyamgram', value: 1.5, count: 2 },
    ]);
  });

  test('groups rows with no field value under Unknown', () => {
    const data = [{ PRICE: 4 }, { location: 'A', PRICE: 2 }];
    const result = averageByField(data, 'location', 'PRICE');
    expect(result).toEqual(
      expect.arrayContaining([
        { label: 'Unknown', value: 4, count: 1 },
        { label: 'A', value: 2, count: 1 },
      ])
    );
  });
});

describe('countByField', () => {
  test('counts rows per value and buckets blanks as Unknown', () => {
    const data = [{ city: 'A' }, { city: 'A' }, { city: 'B' }, {}];
    expect(countByField(data, 'city')).toEqual({ A: 2, B: 1, Unknown: 1 });
  });
});

describe('normalizeCoordinates', () => {
  test('accepts a Kolkata coordinate pair', () => {
    expect(normalizeCoordinates({ LATITUDE: 22.7, LONGITUDE: 88.4 })).toEqual({
      lat: 22.7,
      lng: 88.4,
    });
  });

  test('swaps a reversed Kolkata pair', () => {
    expect(normalizeCoordinates({ LATITUDE: 88.4, LONGITUDE: 22.7 })).toEqual({
      lat: 22.7,
      lng: 88.4,
    });
  });

  test('rejects missing, zero and out-of-area coordinates', () => {
    expect(normalizeCoordinates({})).toBeNull();
    expect(normalizeCoordinates({ LATITUDE: null, LONGITUDE: null })).toBeNull();
    expect(normalizeCoordinates({ LATITUDE: 0, LONGITUDE: 0 })).toBeNull();
    expect(normalizeCoordinates({ LATITUDE: 51.5, LONGITUDE: -0.12 })).toBeNull();
  });
});
