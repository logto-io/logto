import crypto from 'crypto';
import fs, { PathOrFileDescriptor } from 'fs';

import inquirer from 'inquirer';

import { readPrivateKeys } from './oidc';

describe('oidc env-set', () => {
  const envBackup = process.env;

  beforeEach(() => {
    process.env = { ...envBackup };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should read private keys if `OIDC_PRIVATE_KEYS` is provided', async () => {
    process.env.OIDC_PRIVATE_KEYS = '["foo","bar"]';

    const privateKeys = await readPrivateKeys();

    expect(privateKeys).toEqual(['foo', 'bar']);
  });

  it('should read private keys if `OIDC_PRIVATE_KEY` is provided - [compatibility]', async () => {
    process.env.OIDC_PRIVATE_KEY = 'foo';

    const privateKeys = await readPrivateKeys();

    expect(privateKeys).toEqual(['foo']);
  });

  it('should read private keys if `OIDC_PRIVATE_KEY_PATHS` is provided', async () => {
    process.env.OIDC_PRIVATE_KEY_PATHS = '["foo.pem", "bar.pem"]';
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const readFileSyncSpy = jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((path: PathOrFileDescriptor) => path.toString());

    const privateKeys = await readPrivateKeys();

    expect(privateKeys).toEqual(['foo.pem', 'bar.pem']);

    existsSyncSpy.mockRestore();
    readFileSyncSpy.mockRestore();
  });

  it('should read private keys if `OIDC_PRIVATE_KEY_PATH` is provided - [compatibility]', async () => {
    // Unset the `OIDC_PRIVATE_KEY_PATHS` environment variable config by jest.setup.ts.
    process.env.OIDC_PRIVATE_KEY_PATHS = '';

    process.env.OIDC_PRIVATE_KEY_PATH = 'foo.pem';

    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    const readFileSyncSpy = jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((path: PathOrFileDescriptor) => path.toString());

    const privateKeys = await readPrivateKeys();

    expect(privateKeys).toEqual(['foo.pem']);

    existsSyncSpy.mockRestore();
    readFileSyncSpy.mockRestore();
  });

  it('should throw if private keys configured in `OIDC_PRIVATE_KEY_PATHS` are not found', async () => {
    process.env.OIDC_PRIVATE_KEY_PATHS = '["foo.pem","bar.pem"]';
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    await expect(readPrivateKeys).rejects.toMatchError(
      new Error(
        `Private keys ${process.env.OIDC_PRIVATE_KEY_PATHS} configured in env \`OIDC_PRIVATE_KEY_PATHS\` not found.`
      )
    );

    existsSyncSpy.mockRestore();
  });

  it('should generate a default private key if `OIDC_PRIVATE_KEY_PATHS` and `OIDC_PRIVATE_KEYS` are not provided', async () => {
    process.env.OIDC_PRIVATE_KEYS = '';
    process.env.OIDC_PRIVATE_KEY_PATHS = '';

    const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('Intent read file error');
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

    const promptMock = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ confirm: true });

    const generateKeyPairSyncSpy = jest.spyOn(crypto, 'generateKeyPairSync');

    const privateKeys = await readPrivateKeys();

    expect(privateKeys.length).toBe(1);
    expect(generateKeyPairSyncSpy).toHaveBeenCalled();
    expect(writeFileSyncSpy).toHaveBeenCalled();

    readFileSyncSpy.mockRestore();
    promptMock.mockRestore();
    generateKeyPairSyncSpy.mockRestore();
    writeFileSyncSpy.mockRestore();
  });
});
