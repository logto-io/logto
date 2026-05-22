import type { CustomUiCsp, SignInExperience } from '@logto/schemas';
import { HTTPError } from 'ky';

import { baseApi } from '#src/api/api.js';
import { getSignInExperience, updateSignInExperience } from '#src/api/index.js';
import { expectRejects } from '#src/helpers/index.js';

const customScriptSource = 'https://scripts.integration.test';
const customConnectSource = 'wss://events.integration.test';
const customUiAssets = Object.freeze({
  id: 'integration-test-custom-ui',
  createdAt: 1_778_318_116,
});

const customUiCsp = Object.freeze({
  scriptSrc: [` ${customScriptSource.toUpperCase()} `, customScriptSource],
  connectSrc: [customConnectSource],
}) satisfies CustomUiCsp;

const normalizedCustomUiCsp = Object.freeze({
  scriptSrc: [customScriptSource],
  connectSrc: [customConnectSource],
}) satisfies CustomUiCsp;

type CustomUiCspUpdateResult =
  | {
      readonly status: 'updated';
      readonly signInExperience: SignInExperience;
    }
  | {
      readonly status: 'unavailable';
    };

const tryUpdateCustomUiCsp = async (customUiCsp: CustomUiCsp): Promise<CustomUiCspUpdateResult> => {
  try {
    const signInExperience = await updateSignInExperience({ customUiCsp });

    return { status: 'updated', signInExperience };
  } catch (error: unknown) {
    if (!(error instanceof HTTPError) || error.response.status !== 400) {
      throw error;
    }

    const body = (await error.response.json()) as { code?: string };

    if (body.code !== 'request.invalid_input') {
      throw error;
    }

    return { status: 'unavailable' };
  }
};

const getExperienceCspHeader = async (): Promise<string> => {
  const response = await baseApi.get('sign-in', { throwHttpErrors: false });

  return response.headers.get('content-security-policy') ?? '';
};

const getCspDirective = (cspHeader: string, directive: 'script-src' | 'connect-src'): string[] => {
  const directiveValue = cspHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${directive} `));

  return directiveValue?.split(/\s+/).slice(1) ?? [];
};

describe('admin console sign-in experience Custom UI CSP', () => {
  afterEach(async () => {
    await updateSignInExperience({
      customUiAssets: null,
      customUiCsp: {},
    });
  });

  it('should normalize and persist valid Custom UI CSP config when the feature is available', async () => {
    const result = await tryUpdateCustomUiCsp(customUiCsp);

    if (result.status === 'unavailable') {
      await expectRejects(updateSignInExperience({ customUiCsp: normalizedCustomUiCsp }), {
        code: 'request.invalid_input',
        status: 400,
      });
      return;
    }

    expect(result.signInExperience.customUiCsp).toEqual(normalizedCustomUiCsp);

    const signInExperience = await getSignInExperience();

    expect(signInExperience.customUiCsp).toEqual(normalizedCustomUiCsp);
  });

  it('should reject invalid Custom UI CSP config', async () => {
    await expectRejects(
      updateSignInExperience({
        customUiCsp: {
          scriptSrc: ["'unsafe-inline'"],
        },
      }),
      {
        code: 'request.invalid_input',
        status: 400,
      }
    );
  });

  it('should clear Custom UI CSP config with empty source lists', async () => {
    const signInExperience = await updateSignInExperience({
      customUiCsp: {
        scriptSrc: [],
        connectSrc: [],
      },
    });

    expect(signInExperience.customUiCsp).toEqual({});
  });

  it('should append Custom UI CSP sources at runtime only when Custom UI assets are configured', async () => {
    const result = await tryUpdateCustomUiCsp(normalizedCustomUiCsp);

    if (result.status === 'unavailable') {
      await expectRejects(updateSignInExperience({ customUiCsp: normalizedCustomUiCsp }), {
        code: 'request.invalid_input',
        status: 400,
      });
      return;
    }

    await updateSignInExperience({ customUiAssets: null });

    const cspWithoutCustomUiAssets = await getExperienceCspHeader();

    expect(getCspDirective(cspWithoutCustomUiAssets, 'script-src')).not.toContain(
      customScriptSource
    );
    expect(getCspDirective(cspWithoutCustomUiAssets, 'connect-src')).not.toContain(
      customConnectSource
    );

    await updateSignInExperience({ customUiAssets });

    const cspWithCustomUiAssets = await getExperienceCspHeader();
    const scriptSource = getCspDirective(cspWithCustomUiAssets, 'script-src');
    const connectSource = getCspDirective(cspWithCustomUiAssets, 'connect-src');

    expect(scriptSource).toContain(customScriptSource);
    expect(scriptSource).not.toContain(customConnectSource);
    expect(connectSource).toContain(customConnectSource);
    expect(connectSource).not.toContain(customScriptSource);
  });
});
