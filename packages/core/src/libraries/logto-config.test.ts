import { LogtoActionKey, type LogtoAction, type SigningKeyRotationState } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';

import { createLogtoConfigLibrary } from './logto-config.js';

const { jest } = import.meta;

const getRowsByKeys = jest.fn();
const queryUpsertAction = jest.fn(async (key: LogtoActionKey, value: LogtoAction) => ({
  key,
  value,
}));
const getSigningKeyRotationState = jest.fn<Promise<SigningKeyRotationState | undefined>, never[]>();
const poolTransaction = jest.fn();

const createLibrary = () =>
  createLogtoConfigLibrary({
    logtoConfigs: {
      getRowsByKeys,
      upsertAction: queryUpsertAction,
      getSigningKeyRotationState,
    },
    pool: { transaction: poolTransaction },
    wellKnownCache: {},
  } as unknown as Parameters<typeof createLogtoConfigLibrary>[0]);

const action: LogtoAction = {
  enabled: true,
  onExecutionError: 'allow',
  script: `const runAction = () => ({ action: 'continue' });`,
  environmentVariables: {
    API_KEY: '<api-key>',
  },
};

describe('Logto config Action', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('persists and returns Action scripts unchanged', async () => {
    const library = createLibrary();
    const write = await library.upsertAction(LogtoActionKey.PostSignIn, action);

    expect(write.value).toEqual(action);
    expect(queryUpsertAction).toHaveBeenCalledWith(LogtoActionKey.PostSignIn, action);

    getRowsByKeys.mockResolvedValueOnce({
      rows: [{ key: LogtoActionKey.PostSignIn, value: action }],
    });

    await expect(library.getAction(LogtoActionKey.PostSignIn)).resolves.toEqual(action);
  });

  it('lists Actions without transforming scripts', async () => {
    const library = createLibrary();
    const anotherAction: LogtoAction = {
      ...action,
      script: `function runAction() { return { action: 'continue' }; }`,
    };

    getRowsByKeys.mockResolvedValueOnce({
      rows: [
        { key: LogtoActionKey.PostFirstFactorVerification, value: anotherAction },
        { key: LogtoActionKey.PostSignIn, value: action },
      ],
    });

    await expect(library.getActions(new ConsoleLog())).resolves.toEqual({
      [LogtoActionKey.PostFirstFactorVerification]: anotherAction,
      [LogtoActionKey.PostSignIn]: action,
    });
  });

  it('merges Action patches and persists the resulting script', async () => {
    const library = createLibrary();
    const replacementScript = `function runAction() { return { action: 'continue' }; }`;

    getRowsByKeys.mockResolvedValueOnce({
      rows: [{ key: LogtoActionKey.PostSignIn, value: action }],
    });

    const updatedAction = await library.updateAction(LogtoActionKey.PostSignIn, {
      script: replacementScript,
    });

    expect(updatedAction.script).toBe(replacementScript);
    expect(queryUpsertAction).toHaveBeenCalledWith(LogtoActionKey.PostSignIn, {
      ...action,
      script: replacementScript,
    });
  });

  it('preserves the existing script when the Action patch omits script', async () => {
    const library = createLibrary();

    getRowsByKeys.mockResolvedValueOnce({
      rows: [{ key: LogtoActionKey.PostSignIn, value: action }],
    });

    const updatedAction = await library.updateAction(LogtoActionKey.PostSignIn, {
      enabled: false,
    });

    expect(updatedAction).toEqual({
      ...action,
      enabled: false,
    });
    expect(queryUpsertAction).toHaveBeenCalledWith(LogtoActionKey.PostSignIn, {
      ...action,
      enabled: false,
    });
  });
});

describe('promoteScheduledSigningKeyRotation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('skips the locking transaction when no rotation is scheduled', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- undefined is the query's no-row result under test
    getSigningKeyRotationState.mockResolvedValueOnce(undefined);

    await createLibrary().promoteScheduledSigningKeyRotation();

    expect(poolTransaction).not.toHaveBeenCalled();
  });

  it('skips the locking transaction when the rotation state has no scheduled time', async () => {
    getSigningKeyRotationState.mockResolvedValueOnce({ tenantCacheExpiresAt: Date.now() });

    await createLibrary().promoteScheduledSigningKeyRotation();

    expect(poolTransaction).not.toHaveBeenCalled();
  });

  it('skips the locking transaction when the scheduled rotation is in the future', async () => {
    getSigningKeyRotationState.mockResolvedValueOnce({ signingKeyRotationAt: Date.now() + 60_000 });

    await createLibrary().promoteScheduledSigningKeyRotation();

    expect(poolTransaction).not.toHaveBeenCalled();
  });

  it('opens the locking transaction when a scheduled rotation is due', async () => {
    getSigningKeyRotationState.mockResolvedValueOnce({ signingKeyRotationAt: Date.now() - 60_000 });

    await createLibrary().promoteScheduledSigningKeyRotation();

    expect(poolTransaction).toHaveBeenCalledTimes(1);
  });
});
