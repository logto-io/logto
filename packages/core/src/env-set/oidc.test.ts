import crypto from 'crypto';
import fs, { PathOrFileDescriptor } from 'fs';

import inquirer from 'inquirer';

import { readCookieKeys, readPrivateKeys } from './oidc';

describe('oidc env-set', () => {
  const envBackup = process.env;

  beforeEach(() => {
    process.env = { ...envBackup };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should read OIDC private keys if raw `OIDC_PRIVATE_KEYS` is provided', async () => {
    const rawKeys = [
      '-----BEGIN PRIVATE KEY-----\nFoo\n-----END PRIVATE KEY-----',
      '-----BEGIN PRIVATE KEY-----\nBAR\n-----END PRIVATE KEY-----',
    ];
    process.env.OIDC_PRIVATE_KEYS = rawKeys.join(',');

    const privateKeys = await readPrivateKeys();

    expect(privateKeys).toEqual([
      '-----BEGIN PRIVATE KEY-----\nFoo\n-----END PRIVATE KEY-----',
      '-----BEGIN PRIVATE KEY-----\nBAR\n-----END PRIVATE KEY-----',
    ]);
  });

  it('should read OIDC private keys if base64-formatted `OIDC_PRIVATE_KEYS` is provided', async () => {
    const base64Keys = ['foo', 'bar'].map((key) => Buffer.from(key, 'utf8').toString('base64'));
    process.env.OIDC_PRIVATE_KEYS = base64Keys.join(',');

    const privateKeys = await readPrivateKeys();

    expect(privateKeys).toEqual(['foo', 'bar']);
  });

  it('should read OIDC private keys if `OIDC_PRIVATE_KEY_PATHS` is provided', async () => {
    process.env.OIDC_PRIVATE_KEY_PATHS = 'foo.pem, bar.pem';
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const readFileSyncSpy = jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((path: PathOrFileDescriptor) => path.toString());

    const privateKeys = await readPrivateKeys();

    expect(privateKeys).toEqual(['foo.pem', 'bar.pem']);

    existsSyncSpy.mockRestore();
    readFileSyncSpy.mockRestore();
  });

  it('should generate a default OIDC private key if neither `OIDC_PRIVATE_KEY_PATHS` nor `OIDC_PRIVATE_KEYS` is provided', async () => {
    process.env.OIDC_PRIVATE_KEYS = '';
    process.env.OIDC_PRIVATE_KEY_PATHS = '';

    const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('Dummy read file error');
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

  it('should throw if private keys configured in `OIDC_PRIVATE_KEY_PATHS` are not found', async () => {
    process.env.OIDC_PRIVATE_KEY_PATHS = 'foo.pem, bar.pem, baz.pem';
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    await expect(readPrivateKeys()).rejects.toMatchError(
      new Error(
        `Private keys foo.pem, bar.pem, and baz.pem configured in env \`OIDC_PRIVATE_KEY_PATHS\` not found.`
      )
    );

    existsSyncSpy.mockRestore();
  });

  it('should read OIDC cookie keys if `OIDC_COOKIE_KEYS` is provided', async () => {
    process.env.OIDC_COOKIE_KEYS = 'foo, bar';

    const cookieKeys = await readCookieKeys();

    expect(cookieKeys).toEqual(['foo', 'bar']);
  });

  it('should generate a default OIDC cookie key if `OIDC_COOKIE_KEYS` is not provided', async () => {
    process.env.OIDC_COOKIE_KEYS = '';

    const promptMock = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ confirm: true });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const appendFileSyncSpy = jest.spyOn(fs, 'appendFileSync').mockImplementation(() => {});

    const cookieKeys = await readCookieKeys();

    expect(cookieKeys.length).toBe(1);
    expect(appendFileSyncSpy).toHaveBeenCalled();

    promptMock.mockRestore();
    appendFileSyncSpy.mockRestore();
  });
});
