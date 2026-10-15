import { AuthenticationContextMode, LogtoAcr } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { errors, type KoaContextWithOIDC } from 'oidc-provider';

import { createOidcContext } from '#src/test-utils/oidc-provider.js';

import {
  acrUnmetReason,
  buildInteractionPolicy,
  resolveRequestedAcrValues,
} from './interaction-policy.js';

const { jest } = import.meta;

const { provider } = createOidcContext().oidc;
const accountId = 'account-id';
const nowInSeconds = () => Math.floor(Date.now() / 1000);

const getLoginPrompt = () => {
  const loginPrompt = buildInteractionPolicy().get('login');

  if (!loginPrompt) {
    throw new TypeError('login prompt not found');
  }

  return loginPrompt;
};

const getAcrUnmetCheck = () => {
  const check = getLoginPrompt().checks.get(acrUnmetReason);

  if (!check) {
    throw new TypeError('acr_unmet check not found');
  }

  // The provider awaits both functions, so a thrown error surfaces as a rejection.
  return {
    check: async (ctx: KoaContextWithOIDC) => check.check(ctx),
    details: async (ctx: KoaContextWithOIDC) => check.details(ctx),
  };
};

/**
 * Build an authorization context. `session` is a signed-in session with the given `acr` and
 * authentication age in seconds, or `undefined` for a request without a session.
 */
const buildContext = ({
  session,
  params = {},
  result,
  pendingPrompts = [],
}: {
  session?: { acr?: string; age?: number };
  params?: KoaContextWithOIDC['oidc']['params'];
  result?: KoaContextWithOIDC['oidc']['result'];
  pendingPrompts?: string[];
}) => {
  const providerSession = new provider.Session();

  if (session) {
    providerSession.loginAccount({
      accountId,
      acr: session.acr,
      loginTs: nowInSeconds() - (session.age ?? 0),
    });
  }

  return createOidcContext({
    provider,
    session: providerSession,
    params,
    result,
    promptPending: jest.fn((name: string) => pendingPrompts.includes(name)),
  });
};

describe('resolveRequestedAcrValues', () => {
  it('returns undefined when the request carries no acr_values', () => {
    expect(resolveRequestedAcrValues()).toBeUndefined();
    expect(resolveRequestedAcrValues(['urn:logto:acr:mfa'])).toBeUndefined();
  });

  it('preserves the caller order and drops unsupported values and duplicates', () => {
    expect(
      resolveRequestedAcrValues(
        'urn:logto:acr:2fa urn:logto:acr:mfa urn:logto:acr:1fa urn:logto:acr:mfa'
      )
    ).toEqual([LogtoAcr.Mfa, LogtoAcr.FirstFactor]);
  });

  it('returns an empty array when every value is unsupported', () => {
    expect(resolveRequestedAcrValues('urn:logto:acr:2fa phr')).toEqual([]);
  });
});

describe('buildInteractionPolicy', () => {
  it('registers the acr_unmet check first in the login prompt and keeps the default prompts', () => {
    const policy = buildInteractionPolicy();
    const loginPrompt = policy.get('login');

    expect(policy.map(({ name }) => name)).toEqual(['login', 'consent']);
    expect(loginPrompt?.checks.map(({ reason }) => reason)).toEqual([
      acrUnmetReason,
      'login_prompt',
      'no_session',
      'max_age',
      'id_token_hint',
      'claims_id_token_sub_value',
      'essential_acrs',
      'essential_acr',
    ]);
    expect(loginPrompt?.checks.get(acrUnmetReason)?.error).toBe(
      'unmet_authentication_requirements'
    );
  });

  describe('acr_unmet check', () => {
    const check = getAcrUnmetCheck();

    it('does not prompt when the request carries no acr_values', async () => {
      await expect(check.check(buildContext({}))).resolves.toBe(false);
      await expect(
        check.check(buildContext({ session: { acr: LogtoAcr.FirstFactor } }))
      ).resolves.toBe(false);
      await expect(
        check.check(buildContext({ session: { age: 1000 }, params: { max_age: '600' } }))
      ).resolves.toBe(false);
    });

    it.each([false, true])(
      'fails before any interaction when every requested value is unsupported (session: %s)',
      async (hasSession) => {
        await expect(
          check.check(
            buildContext({
              session: conditional(hasSession && { acr: LogtoAcr.Mfa }),
              params: { acr_values: 'urn:logto:acr:2fa' },
            })
          )
        ).rejects.toThrow(errors.UnmetAuthenticationRequirements);
      }
    );

    it('leaves a request without a session to the no_session check', async () => {
      await expect(
        check.check(buildContext({ params: { acr_values: LogtoAcr.Mfa } }))
      ).resolves.toBe(false);
    });

    it.each([
      [LogtoAcr.FirstFactor, LogtoAcr.FirstFactor],
      [LogtoAcr.Mfa, LogtoAcr.Mfa],
      // `mfa` satisfies the weaker class.
      [LogtoAcr.Mfa, LogtoAcr.FirstFactor],
      // Any listed class is enough; the enrolled factors are never consulted.
      [LogtoAcr.FirstFactor, `${LogtoAcr.Mfa} ${LogtoAcr.FirstFactor}`],
      // Unsupported values are ignored rather than failing the request.
      [LogtoAcr.FirstFactor, `urn:logto:acr:2fa ${LogtoAcr.FirstFactor}`],
    ])(
      'does not prompt when the session acr %s satisfies acr_values %j',
      async (acr, acrValues) => {
        await expect(
          check.check(buildContext({ session: { acr }, params: { acr_values: acrValues } }))
        ).resolves.toBe(false);
      }
    );

    it.each([
      [LogtoAcr.FirstFactor, LogtoAcr.Mfa],
      // A social or SSO session records no acr.
      [undefined, LogtoAcr.FirstFactor],
      ['urn:logto:acr:2fa', LogtoAcr.FirstFactor],
    ])('prompts when the session acr %s does not satisfy acr_values %s', async (acr, acrValues) => {
      await expect(
        check.check(buildContext({ session: { acr }, params: { acr_values: acrValues } }))
      ).resolves.toBe(true);
    });

    it('applies the max_age freshness requirement on top of the acr', async () => {
      const params = { acr_values: LogtoAcr.FirstFactor, max_age: '600' };

      await expect(
        check.check(buildContext({ session: { acr: LogtoAcr.Mfa, age: 30 }, params }))
      ).resolves.toBe(false);
      await expect(
        check.check(buildContext({ session: { acr: LogtoAcr.Mfa, age: 1000 }, params }))
      ).resolves.toBe(true);
    });

    it('prompts for prompt=login even when the session satisfies the request', async () => {
      await expect(
        check.check(
          buildContext({
            session: { acr: LogtoAcr.Mfa },
            params: { acr_values: LogtoAcr.FirstFactor, prompt: 'login' },
            pendingPrompts: ['login'],
          })
        )
      ).resolves.toBe(true);
    });

    it('writes the step-up context with the first requested class as the selected one', async () => {
      // A social or SSO session records no acr, so neither listed class is satisfied.
      const ctx = buildContext({
        session: {},
        params: { acr_values: `urn:logto:acr:2fa ${LogtoAcr.Mfa} ${LogtoAcr.FirstFactor}` },
      });

      await expect(check.check(ctx)).resolves.toBe(true);
      await expect(check.details(ctx)).resolves.toEqual({
        authenticationContext: {
          requestedAcrValues: [LogtoAcr.Mfa, LogtoAcr.FirstFactor],
          selectedAcr: LogtoAcr.Mfa,
          mode: AuthenticationContextMode.StepUp,
        },
      });
    });

    describe('after the interaction resumed', () => {
      const result = { login: { accountId } };

      it('does not prompt when the achieved context satisfies the request', async () => {
        await expect(
          check.check(
            buildContext({
              session: { acr: LogtoAcr.Mfa },
              params: { acr_values: LogtoAcr.Mfa, max_age: '600', prompt: 'login' },
              result,
            })
          )
        ).resolves.toBe(false);
      });

      it('fails instead of prompting again when the achieved acr is still unmet', async () => {
        await expect(
          check.check(
            buildContext({
              session: { acr: LogtoAcr.FirstFactor },
              params: { acr_values: LogtoAcr.Mfa },
              result,
            })
          )
        ).rejects.toThrow(errors.UnmetAuthenticationRequirements);
      });

      it('fails instead of prompting again when max_age is still unmet', async () => {
        await expect(
          check.check(
            buildContext({
              session: { acr: LogtoAcr.Mfa, age: 1000 },
              params: { acr_values: LogtoAcr.Mfa, max_age: '600' },
              result,
            })
          )
        ).rejects.toThrow(errors.UnmetAuthenticationRequirements);
      });
    });
  });

  describe('login prompt details', () => {
    const loginPrompt = getLoginPrompt();

    it('keeps the provider details for a request without acr_values', async () => {
      await expect(
        loginPrompt.details?.(
          buildContext({ params: { max_age: '600', login_hint: 'user@example.com' } })
        )
      ).resolves.toEqual({ max_age: '600', login_hint: 'user@example.com' });
    });

    it('carries only the requested values for a sign-in without a session', async () => {
      await expect(
        loginPrompt.details?.(
          buildContext({
            params: { acr_values: `${LogtoAcr.Mfa} urn:logto:acr:2fa`, max_age: '600' },
          })
        )
      ).resolves.toEqual({
        max_age: '600',
        authenticationContext: { requestedAcrValues: [LogtoAcr.Mfa] },
      });
    });
  });
});
