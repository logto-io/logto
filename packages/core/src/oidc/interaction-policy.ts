/**
 * @file The interaction policy that decides from `acr_values` and `max_age` whether the
 * authorization request needs an interaction, fails strictly with
 * `unmet_authentication_requirements`, and tells Experience how to handle the login prompt.
 *
 * OpenID Connect treats `acr_values` as an ordered list of acceptable classes. Logto resolves it as
 * an ordered preference, like other providers that evaluate the listed policies in order and fall
 * back on failure: a session that satisfies the first listed supported class needs no interaction,
 * and a session that satisfies a later one still starts a step-up that pursues the first class the
 * user can reach. `prompt=none` is the one exception — no UI is possible and the policy never reads
 * the user's enrolled methods, so a session that satisfies any listed class is accepted.
 *
 * The policy never decides reachability, which is what keeps it from reading the user's methods:
 * Experience selects the pursued class from the same list and finishes only once it is met. A
 * request that the session already satisfies through a later class is therefore finished inside
 * the interaction without a prompt, and a request that cannot be reached at all fails with
 * `unmet_authentication_requirements` rather than issuing a weaker token.
 */
import {
  AuthenticationContextMode,
  acrSatisfies,
  isLogtoAcr,
  type LogtoAcr,
  type LoginPromptAuthenticationContextDetails,
} from '@logto/schemas';
import { assert, conditional } from '@silverhand/essentials';
import { errors, interactionPolicy, type KoaContextWithOIDC } from 'oidc-provider';

const { Check, base } = interactionPolicy;

/** The login prompt reason written when an authenticated session does not satisfy the request. */
export const acrUnmetReason = 'acr_unmet';

/**
 * Resolve the supported classes from `acr_values`, preserving the caller's order and ignoring
 * unsupported values and duplicates. Returns `undefined` when the request carries no `acr_values`
 * (the provider already normalizes an empty parameter to `undefined`), so such a request behaves
 * exactly as it does today; an empty array means every requested value is unsupported.
 */
export const resolveRequestedAcrValues = (acrValues?: unknown): LogtoAcr[] | undefined =>
  conditional(
    typeof acrValues === 'string' && [
      ...new Set(acrValues.split(' ').filter((value) => isLogtoAcr(value))),
    ]
  );

const getRequestedAcrValues = ({ oidc }: KoaContextWithOIDC) =>
  resolveRequestedAcrValues(oidc.params?.acr_values);

/**
 * Whether the session's authentication is within the requested `max_age`. The provider rewrites
 * `max_age=0` into `prompt=login` before the policy runs, so it is handled by the prompt check.
 */
const isSessionFresh = ({ oidc }: KoaContextWithOIDC) => {
  const { session, params } = oidc;

  return params?.max_age === undefined || !session?.past(Number(params.max_age));
};

/** Whether the session's `acr` satisfies the class the caller listed first. */
const satisfiesFirstRequestedAcr = ({ oidc }: KoaContextWithOIDC, [first]: LogtoAcr[]) =>
  first !== undefined && acrSatisfies(oidc.session?.acr, first);

/** Whether the session's `acr` satisfies any class the caller listed. */
const satisfiesAnyRequestedAcr = ({ oidc }: KoaContextWithOIDC, requestedAcrValues: LogtoAcr[]) =>
  requestedAcrValues.some((acr) => acrSatisfies(oidc.session?.acr, acr));

/**
 * Whether the request itself forces a fresh authentication event, which the context the session
 * already carries can never satisfy: `prompt=login`, which the provider also sets for
 * `max_age=0`, or a `max_age` the session does not meet.
 */
const isReauthenticationRequired = (ctx: KoaContextWithOIDC) =>
  ctx.oidc.promptPending('login') || !isSessionFresh(ctx);

/**
 * Whether this pass is the one after an interaction submission, detected the same way the
 * provider's `promptPending` detects it. `oidc.result` is not a signal: `loadGrant` runs before the
 * interaction policy on the first pass and records app-level access control in `oidc.result`
 * whenever the session already has a grant for a registered client.
 */
const isResumedPass = ({ oidc }: KoaContextWithOIDC) => oidc.route.endsWith('resume');

/**
 * Whether an authenticated session ends the request on the first pass. Without `prompt=none` only
 * the first listed class does, because the interaction pursues the caller's preference order; with
 * `prompt=none` no UI is possible, so any listed class the session can prove is accepted.
 */
const isFirstPassSatisfied = (ctx: KoaContextWithOIDC, requestedAcrValues: LogtoAcr[]) => {
  const { oidc } = ctx;

  if (!isSessionFresh(ctx)) {
    return false;
  }

  if (oidc.promptPending('none')) {
    return satisfiesAnyRequestedAcr(ctx, requestedAcrValues);
  }

  return !oidc.promptPending('login') && satisfiesFirstRequestedAcr(ctx, requestedAcrValues);
};

/**
 * The check that evaluates `acr_values` and `max_age` against the OIDC session. It runs first in
 * the login prompt so that `prompt=none` on an unmet request answers
 * `unmet_authentication_requirements` rather than the provider's `max_age` error.
 *
 * 1. Every requested value unsupported: fail before any interaction.
 * 2. No session: the `no_session` check applies and the sign-in never enters step-up mode; the
 *    prompt-level details carry only the requested values (see {@link buildInteractionPolicy}).
 * 3. On the pass after the interaction resumed, accept a session that satisfies any listed class
 *    within `max_age`, because Experience only finishes once the class it pursues is met and that
 *    class is one of the listed ones. Fail instead of requesting another interaction, so a result
 *    that still does not satisfy the request never loops into another prompt and never issues a
 *    token with insufficient assurance. The resumed pass is detected by route, never by
 *    `oidc.result`, which the first pass already carries for application-level access control.
 * 4. Otherwise, on the first pass, continue without interaction only when the session satisfies
 *    the first listed class and `max_age`, and `prompt=login` was not requested — or, for
 *    `prompt=none`, any listed class. Any other case requests a step-up that carries the whole
 *    requested list: Experience pursues the first class the user can reach, and finishes without UI
 *    when the session already satisfies it.
 *
 * The policy never reads the user's enrolled methods; whether a class is reachable is decided
 * inside the interaction.
 */
const buildAcrUnmetCheck = () =>
  new Check(
    acrUnmetReason,
    'requested authentication context could not be obtained',
    'unmet_authentication_requirements',
    (ctx) => {
      const { oidc } = ctx;
      const requestedAcrValues = getRequestedAcrValues(ctx);

      if (!requestedAcrValues) {
        return Check.NO_NEED_TO_PROMPT;
      }

      if (requestedAcrValues.length === 0) {
        throw new errors.UnmetAuthenticationRequirements(
          'none of the requested acr_values is supported'
        );
      }

      if (!oidc.session?.accountId) {
        return Check.NO_NEED_TO_PROMPT;
      }

      // The pass after an interaction was submitted: the request resumed the interaction, and a
      // step-up the session already satisfies submits no `login`. An unmet request is final, since
      // requesting another interaction would loop.
      if (isResumedPass(ctx)) {
        if (isSessionFresh(ctx) && satisfiesAnyRequestedAcr(ctx, requestedAcrValues)) {
          return Check.NO_NEED_TO_PROMPT;
        }

        throw new errors.UnmetAuthenticationRequirements(
          'the authentication context achieved by the interaction does not satisfy the request'
        );
      }

      return isFirstPassSatisfied(ctx, requestedAcrValues)
        ? Check.NO_NEED_TO_PROMPT
        : Check.REQUEST_PROMPT;
    },
    (ctx): LoginPromptAuthenticationContextDetails => {
      const requestedAcrValues = getRequestedAcrValues(ctx) ?? [];

      // The details are only collected when the check requested the prompt, which requires at
      // least one supported class.
      assert(
        requestedAcrValues.length > 0,
        new TypeError('The step-up prompt requires a supported ACR value')
      );

      return {
        authenticationContext: {
          requestedAcrValues,
          mode: AuthenticationContextMode.StepUp,
          reauthenticationRequired: isReauthenticationRequired(ctx),
        },
      };
    }
  );

/**
 * Build the interaction policy: the provider's default policy with the `acr_values` / `max_age`
 * check registered first in the login prompt.
 *
 * The login prompt details always carry the requested values when the request has supported
 * `acr_values`, so a sign-in without a session (where the `no_session` check applies and the
 * check above stays silent) can treat the requested list as one more completion requirement. When
 * the check requests a step-up, its own details replace this entry with the full step-up context.
 */
export const buildInteractionPolicy = (): interactionPolicy.DefaultPolicy => {
  const policy = base();
  const loginPrompt = policy.get('login');

  assert(loginPrompt, new TypeError('The default interaction policy has no login prompt'));

  loginPrompt.checks.add(buildAcrUnmetCheck(), 0);

  const { details: baseDetails } = loginPrompt;

  // eslint-disable-next-line @silverhand/fp/no-mutation -- the provider's policy is a mutable builder
  loginPrompt.details = async (ctx) => {
    const requestedAcrValues = getRequestedAcrValues(ctx);

    return {
      ...(await baseDetails?.(ctx)),
      ...conditional(
        requestedAcrValues &&
          requestedAcrValues.length > 0 &&
          ({
            authenticationContext: { requestedAcrValues },
          } satisfies LoginPromptAuthenticationContextDetails)
      ),
    };
  };

  return policy;
};
