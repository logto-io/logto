/**
 * @file The interaction policy that decides from `acr_values` and `max_age` whether the
 * authorization request needs an interaction, fails strictly with
 * `unmet_authentication_requirements`, and tells Experience how to handle the login prompt.
 *
 * OpenID Connect treats `acr_values` as a voluntary preference and the provider's built-in checks
 * only handle essential `acr` claims. Logto treats the supported classes as a strict requirement
 * instead: a session that satisfies any requested class gets no prompt, otherwise the first
 * supported value becomes the requirement and Logto never issues a token for a weaker class.
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
 * Whether the session satisfies the request: its `acr` satisfies any requested class, and its
 * authentication is not older than `max_age` when one was requested. The provider rewrites
 * `max_age=0` into `prompt=login` before the policy runs, so it is handled by the prompt check.
 */
const isRequestSatisfied = ({ oidc }: KoaContextWithOIDC, requestedAcrValues: LogtoAcr[]) => {
  const { session, params } = oidc;
  const isAcrSatisfied = requestedAcrValues.some((acr) => acrSatisfies(session?.acr, acr));
  const isFresh = params?.max_age === undefined || !session?.past(Number(params.max_age));

  return isAcrSatisfied && isFresh;
};

/**
 * The check that evaluates `acr_values` and `max_age` against the OIDC session. It runs first in
 * the login prompt so that `prompt=none` on an unmet request answers
 * `unmet_authentication_requirements` rather than the provider's `max_age` error.
 *
 * 1. Every requested value unsupported: fail before any interaction.
 * 2. No session: the `no_session` check applies and the sign-in never enters step-up mode; the
 *    prompt-level details carry only the requested values (see {@link buildInteractionPolicy}).
 * 3. Session satisfies the request and `prompt=login` was not requested: continue without
 *    interaction.
 * 4. Otherwise, on the first pass, require a step-up interaction that pins the session subject and
 *    selects the first requested class as the minimum to reach.
 * 5. On the pass after the interaction resumed, re-check with the same rule and fail instead of
 *    requesting another interaction, so a result that still does not satisfy the request never
 *    loops into another prompt and never issues a token with insufficient assurance.
 *
 * The policy never reads the user's enrolled methods; whether the selected class is reachable is
 * decided inside the interaction.
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

      const isSatisfied = isRequestSatisfied(ctx, requestedAcrValues);

      // The pass after the interaction resumed: the session now carries the context the
      // interaction achieved, so an unmet request is final.
      if (oidc.result?.login) {
        if (isSatisfied) {
          return Check.NO_NEED_TO_PROMPT;
        }

        throw new errors.UnmetAuthenticationRequirements(
          'the authentication context achieved by the interaction does not satisfy the request'
        );
      }

      if (isSatisfied && !oidc.promptPending('login')) {
        return Check.NO_NEED_TO_PROMPT;
      }

      return Check.REQUEST_PROMPT;
    },
    (ctx): LoginPromptAuthenticationContextDetails => {
      const requestedAcrValues = getRequestedAcrValues(ctx) ?? [];
      const [selectedAcr] = requestedAcrValues;

      // The details are only collected when the check requested the prompt, which requires at
      // least one supported class.
      assert(selectedAcr, new TypeError('The step-up prompt requires a supported ACR value'));

      return {
        authenticationContext: {
          requestedAcrValues,
          selectedAcr,
          mode: AuthenticationContextMode.StepUp,
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
 * check above stays silent) can treat the first requested class as one more completion
 * requirement. When the check requests a step-up, its own details replace this entry with the
 * full step-up context.
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
