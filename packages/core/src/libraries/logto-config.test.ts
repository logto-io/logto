import { LogtoActionKey, type LogtoAction } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';

import {
  unwrapActionScriptFromLegacyRunner,
  wrapActionScriptForLegacyRunner,
} from '#src/utils/action-script-compatibility.js';

import { createLogtoConfigLibrary } from './logto-config.js';

const { jest } = import.meta;

const getRowsByKeys = jest.fn();
const queryUpsertAction = jest.fn(async (key: LogtoActionKey, value: LogtoAction) => ({
  key,
  value,
}));

const createLibrary = () =>
  createLogtoConfigLibrary({
    logtoConfigs: {
      getRowsByKeys,
      upsertAction: queryUpsertAction,
    },
  } as unknown as Parameters<typeof createLogtoConfigLibrary>[0]);

const action: LogtoAction = {
  enabled: true,
  onExecutionError: 'allow',
  script: `const runAction = () => ({ action: 'continue' });`,
  environmentVariables: {
    API_KEY: '<api-key>',
  },
};

describe('Logto config Action compatibility', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('keeps repeated write and read cycles idempotent', async () => {
    const library = createLibrary();
    const firstWrite = await library.upsertAction(LogtoActionKey.PostSignIn, action);
    const firstPersisted = queryUpsertAction.mock.calls[0]?.[1];

    expect(firstWrite.value).toEqual(action);
    expect(firstPersisted).toBeDefined();
    if (!firstPersisted) {
      throw new Error('Expected an Action config to be persisted');
    }
    expect(firstPersisted.script).not.toBe(action.script);
    expect(unwrapActionScriptFromLegacyRunner(firstPersisted.script)).toBe(action.script);

    getRowsByKeys.mockResolvedValueOnce({
      rows: [{ key: LogtoActionKey.PostSignIn, value: firstPersisted }],
    });
    const readAfterFirstWrite = await library.getAction(LogtoActionKey.PostSignIn);

    expect(readAfterFirstWrite).toEqual(action);

    const secondWrite = await library.upsertAction(LogtoActionKey.PostSignIn, readAfterFirstWrite);
    const secondPersisted = queryUpsertAction.mock.calls[1]?.[1];

    expect(secondWrite.value).toEqual(action);
    expect(secondPersisted).toEqual(firstPersisted);
  });

  it('returns existing unwrapped legacy scripts unchanged', async () => {
    const library = createLibrary();
    const legacyAction: LogtoAction = {
      ...action,
      script: `const runInlineHook = () => ({ action: 'continue' });`,
    };

    getRowsByKeys.mockResolvedValueOnce({
      rows: [{ key: LogtoActionKey.PostSignIn, value: legacyAction }],
    });

    await expect(library.getAction(LogtoActionKey.PostSignIn)).resolves.toEqual(legacyAction);
  });

  it.each([
    ['keeps the original script when the patch omits it', { enabled: false }, action.script],
    [
      'persists a replacement script once',
      { script: `function runAction() { return { action: 'continue' }; }` },
      `function runAction() { return { action: 'continue' }; }`,
    ],
  ])('%s', async (_name, patch, expectedScript) => {
    const library = createLibrary();
    const persistedAction: LogtoAction = {
      ...action,
      script: wrapActionScriptForLegacyRunner(action.script),
    };

    getRowsByKeys.mockResolvedValueOnce({
      rows: [{ key: LogtoActionKey.PostSignIn, value: persistedAction }],
    });

    const updatedAction = await library.updateAction(LogtoActionKey.PostSignIn, patch);
    const updatedPersistedAction = queryUpsertAction.mock.calls[0]?.[1];

    expect(updatedAction.script).toBe(expectedScript);
    expect(updatedPersistedAction).toBeDefined();
    if (!updatedPersistedAction) {
      throw new Error('Expected the updated Action config to be persisted');
    }
    expect(unwrapActionScriptFromLegacyRunner(updatedPersistedAction.script)).toBe(expectedScript);
    expect(wrapActionScriptForLegacyRunner(updatedPersistedAction.script)).toBe(
      updatedPersistedAction.script
    );
  });

  it('unwraps only persisted compatibility scripts when listing Actions', async () => {
    const library = createLibrary();
    const legacyAction: LogtoAction = {
      ...action,
      script: `function runInlineHook() { return { action: 'continue' }; }`,
    };
    const persistedAction: LogtoAction = {
      ...action,
      script: wrapActionScriptForLegacyRunner(action.script),
    };

    getRowsByKeys.mockResolvedValueOnce({
      rows: [
        { key: LogtoActionKey.PostFirstFactorVerification, value: legacyAction },
        { key: LogtoActionKey.PostSignIn, value: persistedAction },
      ],
    });

    await expect(library.getActions(new ConsoleLog())).resolves.toEqual({
      [LogtoActionKey.PostFirstFactorVerification]: legacyAction,
      [LogtoActionKey.PostSignIn]: action,
    });
  });
});
