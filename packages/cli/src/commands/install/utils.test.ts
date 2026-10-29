import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';

import { checkNodeVersion, validateServerNodeVersion } from './utils.js';

const createInstallPath = async (packageJson?: unknown) => {
  const installPath = await mkdtemp(path.join(os.tmpdir(), 'logto-install-'));

  onTestFinished(async () => {
    await rm(installPath, { force: true, recursive: true });
  });

  if (packageJson !== undefined) {
    await writeFile(path.join(installPath, 'package.json'), JSON.stringify(packageJson));
  }

  return installPath;
};

describe('checkNodeVersion', () => {
  it('should fail when the current major version is lower than the required one', () => {
    expect(checkNodeVersion('^26.0.0', 'v22.14.0')).toEqual({
      fatalError: 'Logto requires NodeJS ^26.0.0, but 22.14.0 found.',
    });
  });

  it('should pass for a version inside a multi-range requirement', () => {
    const required = '^22.23.4 || ^24.22.1 || ^26.12.1';

    expect(checkNodeVersion(required, 'v22.23.4')).toEqual({});
    expect(checkNodeVersion(required, 'v24.22.1')).toEqual({});
    expect(checkNodeVersion(required, 'v26.12.1')).toEqual({});
  });

  it('should only warn for a supported major version below the minimum', () => {
    expect(checkNodeVersion('^22.23.4 || ^24.22.1 || ^26.12.1', 'v22.14.0')).toEqual({
      warning:
        'Logto is tested under NodeJS ^22.23.4 || ^24.22.1 || ^26.12.1, but version 22.14.0 found.',
    });
  });

  it('should only warn for a higher major version', () => {
    expect(checkNodeVersion('^26.0.0', 'v27.0.0')).toEqual({
      warning: 'Logto is tested under NodeJS ^26.0.0, but version 27.0.0 found.',
    });
  });

  it('should only warn for a major version between the supported ranges', () => {
    expect(checkNodeVersion('^22.23.4 || ^26.12.1', 'v24.0.0')).toEqual({
      warning: 'Logto is tested under NodeJS ^22.23.4 || ^26.12.1, but version 24.0.0 found.',
    });
  });

  it('should handle comparator, tilde and wildcard ranges', () => {
    expect(checkNodeVersion('>=22.14.0', 'v26.12.1')).toEqual({});
    expect(checkNodeVersion('>=26.0.0', 'v22.14.0')).toEqual({
      fatalError: 'Logto requires NodeJS >=26.0.0, but 22.14.0 found.',
    });
    expect(checkNodeVersion('~22.23.4', 'v26.12.1')).toEqual({
      warning: 'Logto is tested under NodeJS ~22.23.4, but version 26.12.1 found.',
    });
    expect(checkNodeVersion('22.x', 'v24.0.0')).toEqual({
      warning: 'Logto is tested under NodeJS 22.x, but version 24.0.0 found.',
    });
  });

  it('should do nothing for an unparsable range', () => {
    expect(checkNodeVersion('not-a-range', 'v26.12.1')).toEqual({});
  });
});

describe('validateServerNodeVersion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should do nothing when the release has no engines field', async () => {
    const installPath = await createInstallPath({ name: 'logto' });

    await expect(validateServerNodeVersion(installPath)).resolves.toBeUndefined();
  });

  it('should do nothing when the release has no package.json', async () => {
    const installPath = await createInstallPath();

    await expect(validateServerNodeVersion(installPath)).resolves.toBeUndefined();
  });

  it('should remove the installation when the release needs a newer Node.js version', async () => {
    const installPath = await createInstallPath({ engines: { node: '^99.0.0' } });

    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {
      // Keep the fatal message out of the test output.
    });

    await expect(validateServerNodeVersion(installPath)).rejects.toThrow('process.exit');
    await expect(access(installPath)).rejects.toThrow();
  });
});
