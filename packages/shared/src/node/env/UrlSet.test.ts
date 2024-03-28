import { afterEach, describe, expect, it } from 'vitest';

import UrlSet from './UrlSet.js';

describe('UrlSet', () => {
  const backupEnv = process.env;

  afterEach(() => {
    process.env = backupEnv;
  });

  it('should resolve proper values when localhost is enabled and endpoint is provided', async () => {
    process.env = {
      ...backupEnv,
      ENDPOINT: 'https://logto.mock',
      ADMIN_ENDPOINT: 'https://admin.logto.mock',
    };

    const set1 = new UrlSet(true, 3001);

    expect(set1.deduplicated()).toStrictEqual([
      new URL('https://localhost:3001'),
      new URL('https://logto.mock'),
    ]);
    expect(set1.origins).toStrictEqual([
      new URL('https://localhost:3001').origin,
      new URL('https://logto.mock').origin,
    ]);
    expect(set1.port).toEqual(3001);
    expect(set1.localhostUrl).toEqual(new URL('https://localhost:3001'));
    expect(set1.endpoint).toEqual(new URL('https://logto.mock'));

    const set2 = new UrlSet(false, 3002, 'ADMIN_');

    expect(set2.deduplicated()).toStrictEqual([
      new URL('http://localhost:3002/'),
      new URL('https://admin.logto.mock/'),
    ]);
    expect(set2.origins).toStrictEqual([
      new URL('http://localhost:3002/').origin,
      new URL('https://admin.logto.mock/').origin,
    ]);
    expect(set2.port).toEqual(3002);
    expect(set2.localhostUrl).toEqual(new URL('http://localhost:3002'));
    expect(set2.endpoint).toEqual(new URL('https://admin.logto.mock'));
  });

  it('should resolve proper values when localhost is enabled and endpoint is not provided', async () => {
    process.env = {
      ...backupEnv,
      ENDPOINT: undefined,
    };

    const set1 = new UrlSet(false, 3001);

    expect(set1.deduplicated()).toStrictEqual([new URL('http://localhost:3001/')]);
    expect(set1.origins).toStrictEqual([new URL('http://localhost:3001/').origin]);
    expect(set1.port).toEqual(3001);
    expect(set1.localhostUrl).toEqual(new URL('http://localhost:3001'));
    expect(set1.endpoint).toEqual(new URL('http://localhost:3001'));
  });

  it('should resolve proper values when localhost is disabled and endpoint is provided', async () => {
    process.env = {
      ...backupEnv,
      ENDPOINT: 'https://logto.mock/logto',
      DISABLE_LOCALHOST: '1',
    };

    const set1 = new UrlSet(true, 3001);

    expect(set1.deduplicated()).toStrictEqual([new URL('https://logto.mock/logto')]);
    expect(set1.origins).toStrictEqual([new URL('https://logto.mock/logto').origin]);
    expect(() => set1.port).toThrowError('Localhost has been disabled in this URL Set.');
    expect(() => set1.localhostUrl).toThrowError('Localhost has been disabled in this URL Set.');
    expect(set1.endpoint).toEqual(new URL('https://logto.mock/logto'));
  });

  it('should resolve proper values when localhost is disabled and endpoint is not provided', async () => {
    process.env = {
      ...backupEnv,
      ADMIN_ENDPOINT: undefined,
      ADMIN_DISABLE_LOCALHOST: '1',
    };

    const set1 = new UrlSet(false, 3002, 'ADMIN_');

    expect(set1.deduplicated()).toStrictEqual([]);
    expect(set1.origins).toStrictEqual([]);
    expect(() => set1.port).toThrowError('Localhost has been disabled in this URL Set.');
    expect(() => set1.localhostUrl).toThrowError('Localhost has been disabled in this URL Set.');
    expect(() => set1.endpoint).toThrowError('No available endpoint in this URL Set.');
  });
});
