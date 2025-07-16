import { describe, expect, it } from 'vitest';

import { getTimestampFromFilename } from './utils.js';

const fileNames = ['1.0.0-1663923770-a.js', '1.0.1-1663923771.1-b.js', 'next-1663923772.12-c.js'];
const invalidFileNames = [
  '1.0.0-1663923770000-a.js',
  'next-1663923772345-c.js',
  'next-1663923772345.1-c.js',
];

describe('getTimestampFromFilename', () => {
  it('should extract timestamp from valid filenames', () => {
    for (const fileName of fileNames) {
      const timestamp = getTimestampFromFilename(fileName);
      expect(timestamp).toBeGreaterThan(0);
    }

    const newTimeStamp = Math.ceil(Date.now() / 1000);
    const newFileName = `next-${newTimeStamp}-c.js`;

    expect(getTimestampFromFilename(newFileName)).toBe(newTimeStamp);
  });

  it('should throw an error for invalid timestamp', () => {
    for (const fileName of invalidFileNames) {
      expect(() => getTimestampFromFilename(fileName)).toThrow(
        `Invalid timestamp format in filename: ${fileName}`
      );
    }

    const newTimeStamp = Date.now();
    expect(() => getTimestampFromFilename(`next-${newTimeStamp}-c.js`)).toThrow(
      `Invalid timestamp format in filename: next-${newTimeStamp}-c.js`
    );
  });
});
