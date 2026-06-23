import { LogtoInlineHookKey } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import { LocalVmError } from '#src/utils/custom-jwt/index.js';

import { InlineHookLibrary } from './inline-hook.js';
import type { LogtoConfigLibrary } from './logto-config.js';

const { jest } = import.meta;

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
const getInlineHook = jest.fn() as jest.MockedFunction<LogtoConfigLibrary['getInlineHook']>;
const library = new InlineHookLibrary({ getInlineHook } as unknown as LogtoConfigLibrary);

const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', isDevFeaturesEnabled);
};

describe('InlineHookLibrary', () => {
  beforeEach(() => {
    setDevFeaturesEnabled(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('loads hook config and runs enabled inline hook script in local VM', async () => {
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      environmentVariables: {
        NAME_SUFFIX: ' updated',
      },
      script: `
        const runInlineHook = ({ event, environmentVariables, api }) => ({
          action: 'updateUser',
          user: {
            name: event.user.name + environmentVariables.NAME_SUFFIX,
          },
          apiFrozen: Object.isFrozen(api),
        });
      `,
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {
          key: LogtoInlineHookKey.PostSignIn,
          interactionEvent: 'SignIn',
          user: {
            id: 'foo',
            name: 'Foo',
          },
        },
      })
    ).resolves.toEqual({
      action: 'updateUser',
      user: {
        name: 'Foo updated',
      },
      apiFrozen: true,
    });

    expect(getInlineHook).toHaveBeenCalledWith(LogtoInlineHookKey.PostSignIn);
  });

  it('does not load or run hooks when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();

    expect(getInlineHook).not.toHaveBeenCalled();
  });

  it('does not run disabled hooks', async () => {
    getInlineHook.mockResolvedValueOnce({
      enabled: false,
      script: `
        const runInlineHook = () => {
          throw new Error('should not run');
        };
      `,
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();
  });

  it('throws LocalVmError when inline hook denies access', async () => {
    const script = `
      const runInlineHook = ({ api }) => api.denyAccess('Nope');
    `;

    await expect(
      InlineHookLibrary.runScriptInLocalVm({
        script,
        event: {},
      })
    ).rejects.toBeInstanceOf(LocalVmError);

    try {
      await InlineHookLibrary.runScriptInLocalVm({
        script,
        event: {},
      });
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(LocalVmError);
      await expect((error as LocalVmError).response.json()).resolves.toEqual({
        message: 'Nope',
        error: {
          code: 'AccessDenied',
          message: 'Nope',
        },
      });
    }
  });
});
