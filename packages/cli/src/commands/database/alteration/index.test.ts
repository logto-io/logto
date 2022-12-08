import { AlterationStateKey } from '@logto/schemas';
import Sinon from 'sinon';
import { createMockPool, createMockQueryResult } from 'slonik';

import { getAlterationFiles, getTimestampFromFilename, getUndeployedAlterations } from './index.js';
import { chooseAlterationsByVersion } from './version.js';

const createPoolWithAlterationTimestamp = (timestamp: number) =>
  createMockPool({
    query: async () => {
      return createMockQueryResult([
        {
          key: AlterationStateKey.AlterationState,
          // @ts-expect-error should allow JSON type
          value: { timestamp },
        },
      ]);
    },
  });

describe('getUndeployedAlterations()', () => {
  it('returns all files if database timestamp is 0', async () => {
    const files = await getAlterationFiles();
    const pool = createPoolWithAlterationTimestamp(0);

    // Make sure it's worth to test
    expect(files.length).toBeGreaterThan(3);
    await expect(getUndeployedAlterations(pool)).resolves.toEqual(files);
  });

  it('returns files whose timestamp is greater then database timestamp', async () => {
    const files = await getAlterationFiles();
    const testTime = 1_663_923_770;
    const pool = createPoolWithAlterationTimestamp(testTime);

    await expect(getUndeployedAlterations(pool)).resolves.toEqual(
      files.filter(({ filename }) => getTimestampFromFilename(filename) > testTime)
    );
  });
});

describe('chooseAlterationsByVersion()', () => {
  const files = Object.freeze(
    [
      '1.0.0_beta.9-1663923770-a.js',
      '1.0.0_beta.9-1663923771-b.js',
      '1.0.0_beta.10-1663923772-c.js',
      '1.0.0_beta.11-1663923773-c.js',
      '1.0.0_beta.11-1663923774-c.js',
      '1.0.0-1663923775-c.js',
      '1.0.0-1663923776-c.js',
      '1.0.1-1663923777-c.js',
      '1.2.0-1663923778-c.js',
      'next-1663923778-c.js',
      'next-1663923779-c.js',
      'next-1663923780-c.js',
      'next1-1663923781-c.js',
    ].map((filename) => ({ filename, path: '/alterations/' + filename }))
  );

  it('chooses nothing when input version is invalid', async () => {
    await expect(chooseAlterationsByVersion(files, 'next1')).rejects.toThrow(
      new TypeError('Invalid Version: next1')
    );
    await expect(chooseAlterationsByVersion([], 'ok')).rejects.toThrow(
      new TypeError('Invalid Version: ok')
    );
  });

  it('chooses correct alteration files', async () => {
    const stub = Sinon.stub(global, 'process').value({ stdin: { isTTY: false } });
    await Promise.all([
      expect(chooseAlterationsByVersion([], 'v1.0.0')).resolves.toEqual([]),
      expect(chooseAlterationsByVersion(files, 'v1.0.0')).resolves.toEqual(files.slice(0, 7)),
      expect(chooseAlterationsByVersion(files, 'v1.0.0-beta.10')).resolves.toEqual(
        files.slice(0, 3)
      ),
      expect(chooseAlterationsByVersion(files, 'v1.1.0')).resolves.toEqual(files.slice(0, 8)),
      expect(chooseAlterationsByVersion(files, 'v1.2.0')).resolves.toEqual(files.slice(0, 9)),
      expect(chooseAlterationsByVersion(files, 'next')).resolves.toEqual(files.slice(0, 12)),
    ]);
    stub.restore();
  });
});
