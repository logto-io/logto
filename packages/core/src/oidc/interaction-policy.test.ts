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
 * authentication age in seconds, or `undefined` for a request without a session. `route` is the
 * matched provider route, e.g. `resume` for the pass after an interaction was submitted.
 */
const buildContext = ({
  session,
  params = {},
  result,
  route = '',
  pendingPrompts = [],
}: {
  session?: { acr?: string; age?: number };
  params?: KoaContextWithOIDC['oidc']['params'];
  result?: KoaContextWithOIDC['oidc']['result'];
  route?: string;
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
    route,
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
      // The first listed class is the one that must be satisfied: a `1fa` session still gets a
      // step-up for `mfa` first, because `mfa` may be reachable.
      [LogtoAcr.Mfa, `${LogtoAcr.Mfa} ${LogtoAcr.FirstFactor}`],
      // Unsupported values are ignored rather than failing the request.
      [LogtoAcr.FirstFactor, `urn:logto:acr:2fa ${LogtoAcr.FirstFactor}`],
    ])(
      'does not prompt when the session acr %s satisfies the first listed acr_values %j',
      async (acr, acrValues) => {
        await expect(
          check.check(buildContext({ session: { acr }, params: { acr_values: acrValues } }))
        ).resolves.toBe(false);
      }
    );

    it.each([
      [LogtoAcr.FirstFactor, LogtoAcr.Mfa],
      // A session that satisfies a later class still starts a step-up: the first reachable class is
      // decided inside the interaction, never by the policy.
      [LogtoAcr.FirstFactor, `${LogtoAcr.Mfa} ${LogtoAcr.FirstFactor}`],
      // A social or SSO session records no acr.
      [undefined, LogtoAcr.FirstFactor],
      ['urn:logto:acr:2fa', LogtoAcr.FirstFactor],
    ])('prompts when the session acr %s does not satisfy acr_values %s', async (acr, acrValues) => {
      await expect(
        check.check(buildContext({ session: { acr }, params: { acr_values: acrValues } }))
      ).resolves.toBe(true);
    });

    it('accepts any listed class for prompt=none, which has no UI to pursue a preference', async () => {
      await expect(
        check.check(
          buildContext({
            session: { acr: LogtoAcr.FirstFactor },
            params: { acr_values: `${LogtoAcr.Mfa} ${LogtoAcr.FirstFactor}`, prompt: 'none' },
            pendingPrompts: ['none'],
          })
        )
      ).resolves.toBe(false);

      await expect(
        check.check(
          buildContext({
            session: { acr: LogtoAcr.FirstFactor },
            params: { acr_values: LogtoAcr.Mfa, prompt: 'none' },
            pendingPrompts: ['none'],
          })
        )
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

    it('writes the step-up context with the whole requested list and no selection', async () => {
      // A social or SSO session records no acr, so neither listed class is satisfied.
      const ctx = buildContext({
        session: {},
        params: { acr_values: `urn:logto:acr:2fa ${LogtoAcr.Mfa} ${LogtoAcr.FirstFactor}` },
      });

      await expect(check.check(ctx)).resolves.toBe(true);
      await expect(check.details(ctx)).resolves.toEqual({
        authenticationContext: {
          requestedAcrValues: [LogtoAcr.Mfa, LogtoAcr.FirstFactor],
          mode: AuthenticationContextMode.StepUp,
          reauthenticationRequired: false,
        },
      });
    });

    it('marks the step-up as forced when the request requires a fresh authentication', async () => {
      const loginCtx = buildContext({
        session: { acr: LogtoAcr.FirstFactor },
        params: { acr_values: LogtoAcr.FirstFactor, prompt: 'login' },
        pendingPrompts: ['login'],
      });
      const staleCtx = buildContext({
        session: { acr: LogtoAcr.FirstFactor, age: 1000 },
        params: { acr_values: LogtoAcr.FirstFactor, max_age: '600' },
      });

      await expect(check.details(loginCtx)).resolves.toMatchObject({
        authenticationContext: { reauthenticationRequired: true },
      });
      await expect(check.details(staleCtx)).resolves.toMatchObject({
        authenticationContext: { reauthenticationRequired: true },
      });
    });

    it('ignores the application access control result a first pass already carries', async () => {
      // `loadGrant` runs before the interaction policy on the first pass and records application
      // access control in `oidc.result` whenever the session already has a grant for a registered
      // client. That must not read as a resumed interaction: `mfa` is listed first and may be
      // reachable, and a social session still has to reach `1fa`.
      const appLevelAccessControl = {
        appLevelAccessControl: { checked: true, applicationId: 'app_id', userId: accountId },
      };

      await expect(
        check.check(
          buildContext({
            session: { acr: LogtoAcr.FirstFactor },
            params: { acr_values: `${LogtoAcr.Mfa} ${LogtoAcr.FirstFactor}` },
            result: appLevelAccessControl,
          })
        )
      ).resolves.toBe(true);

      await expect(
        check.check(
          buildContext({
            session: {},
            params: { acr_values: LogtoAcr.FirstFactor },
            result: appLevelAccessControl,
          })
        )
      ).resolves.toBe(true);
    });

    describe('after the interaction resumed', () => {
      const result = { login: { accountId } };
      const route = 'resume';

      it('does not prompt when the achieved context satisfies the request', async () => {
        await expect(
          check.check(
            buildContext({
              session: { acr: LogtoAcr.Mfa },
              params: { acr_values: LogtoAcr.Mfa, max_age: '600', prompt: 'login' },
              result,
              route,
            })
          )
        ).resolves.toBe(false);
      });

      it('does not prompt when a step-up the session already satisfied submitted no login', async () => {
        // A `[mfa, 1fa]` step-up on a `1fa` session whose `mfa` is unreachable finishes without a
        // `login` result, leaving the session's `1fa` in place. Any listed class is enough here.
        await expect(
          check.check(
            buildContext({
              session: { acr: LogtoAcr.FirstFactor },
              params: { acr_values: `${LogtoAcr.Mfa} ${LogtoAcr.FirstFactor}` },
              result: { interactionEvent: 'SignIn' },
              route,
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
              route,
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
              route,
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
