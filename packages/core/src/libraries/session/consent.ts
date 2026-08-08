import { jsonObjectGuard } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { Context } from 'koa';
import type { PromptDetail, Provider } from 'oidc-provider';
import { errors } from 'oidc-provider';
import { z } from 'zod';

import { type EnvSet } from '#src/env-set/index.js';
import { markAppLevelAccessControlChecked } from '#src/oidc/application-access-control.js';
import { isCimdClient } from '#src/oidc/cimd/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { updateInteractionResult } from './interaction.js';

// Get the missing scopes from prompt details
const missingScopesGuard = z.object({
  missingOIDCScope: z.string().array().optional(),
  missingResourceScopes: z.object({}).catchall(z.string().array()).optional(),
});

export const getMissingScopes = (prompt: PromptDetail) => {
  return missingScopesGuard.parse(prompt.details);
};

/** Exactly one identifier is present, matching the kind of the consenting client. */
type ClientIdentifiers = {
  registeredClientId?: string;
  cimdClientId?: string;
};

/**
 * The identifier shape is a sufficient classifier here: registered application ids never take
 * the URL shape, and authorization has already resolved the client — resolving it again via
 * `provider.Client.find` would cost a lookup (or an outbound document fetch on a cold cache)
 * on every consent submission for the same verdict.
 */
const identifyClient = (envSet: EnvSet, clientId: string): ClientIdentifiers =>
  isCimdClient(envSet, clientId) ? { cimdClientId: clientId } : { registeredClientId: clientId };

/**
 * `users.application_id` and `users.cimd_client_id` form a single first-consent attribution,
 * so a user already attributed through either column is never written again. The columns stay
 * separate because `application_id` (varchar(21)) only ever holds registered application ids —
 * a CIMD client identifier URL must never reach it.
 */
const saveUserFirstConsentedClient = async (
  queries: Queries,
  userId: string,
  { registeredClientId, cimdClientId }: ClientIdentifiers
) => {
  const { findUserById, updateUserById } = queries.users;
  const user = await findUserById(userId);

  if (user.applicationId ?? user.cimdClientId) {
    return;
  }

  if (registeredClientId) {
    await updateUserById(userId, { applicationId: registeredClientId });
    return;
  }

  if (cimdClientId) {
    await updateUserById(userId, { cimdClientId });
  }
};

/**
 * Persists the interaction's `lastSubmission` information to the session for future reference.
 *
 * @remarks
 * Interaction lifecycle:
 * 1. User visits the /authorization endpoint. No session is found, so a new `login` interaction is created and the user is prompted to log in.
 * 2. The user completes and submits the `login` interaction with their authenticated `accountId` and interaction details.
 * 3. The `login` interaction is destroyed and removed from the `oidc_model_instances` database.
 * 4. A new authentication session is created with the `accountId` and saved to the `oidc_model_instances` database.
 * 5. If no grant is found, a new `consent` interaction is created and the user is prompted to provide consent.
 * 6. The user completes the consent form or is auto-consented for the requested scopes, then submits the `consent` interaction with the `grantId`.
 * 7. The `consent` interaction is destroyed and removed from the `oidc_model_instances` database.
 * 8. A new `Grant` is created and saved to the database, and the session is updated with the grant information.
 *
 * In the OIDC provider implementation, a user authentication session is created only after a successful `login` interaction submission.
 * The original interaction instance is then destroyed and removed from the `oidc_model_instances` database, making it impossible to retrieve the user's original interaction details for the active session.
 * To address this, we manually persist the `lastSubmission` information from the interaction details to the session.
 *
 * This function should be called at the user consent step, after the authentication session is created
 * and before the `consent` interaction is destroyed. It retrieves both the session uid and `lastSubmission` from the interaction details,
 * and stores them in the `oidc_session_extensions` table.
 */
const saveInteractionLastSubmissionToSession = async (
  queries: Queries,
  interactionDetails: Awaited<ReturnType<Provider['interactionDetails']>>,
  { registeredClientId, cimdClientId }: ClientIdentifiers
) => {
  const { session, lastSubmission } = interactionDetails;

  if (!session || !lastSubmission) {
    return;
  }

  const { oidcSessionExtensions } = queries;
  const result = jsonObjectGuard.safeParse(lastSubmission);

  if (result.success) {
    /**
     * The explicit `null` on the unused identifier column makes the upsert overwrite a stale
     * value left by a previous submission of the other client type.
     */
    await oidcSessionExtensions.insert({
      sessionUid: session.uid,
      accountId: session.accountId,
      lastSubmission: result.data,
      clientId: registeredClientId ?? null,
      cimdClientId: cimdClientId ?? null,
    });
  }
};

export const consent = async ({
  ctx,
  provider,
  envSet,
  queries,
  interactionDetails,
  missingOIDCScopes = [],
  resourceScopesToGrant = {},
  resourceScopesToReject = {},
  markAppLevelAccessControlChecked: shouldMarkAppLevelAccessControlChecked = false,
}: {
  ctx: Context;
  provider: Provider;
  envSet: EnvSet;
  queries: Queries;
  interactionDetails: Awaited<ReturnType<Provider['interactionDetails']>>;
  missingOIDCScopes?: string[];
  resourceScopesToGrant?: Record<string, string[]>;
  resourceScopesToReject?: Record<string, string[]>;
  markAppLevelAccessControlChecked?: boolean;
}) => {
  const {
    session,
    grantId,
    params: { client_id: clientId },
  } = interactionDetails;

  assertThat(session, 'session.not_found');
  assertThat(
    clientId && typeof clientId === 'string',
    new errors.InvalidClient('client must be available')
  );

  const { accountId } = session;

  const { registeredClientId, cimdClientId } = identifyClient(envSet, clientId);

  const grant =
    conditional(grantId && (await provider.Grant.find(grantId))) ??
    new provider.Grant({ accountId, clientId });

  await Promise.all([
    saveUserFirstConsentedClient(queries, accountId, { registeredClientId, cimdClientId }),
    saveInteractionLastSubmissionToSession(queries, interactionDetails, {
      registeredClientId,
      cimdClientId,
    }),
  ]);

  // Fulfill missing scopes
  if (missingOIDCScopes.length > 0) {
    grant.addOIDCScope(missingOIDCScopes.join(' '));
  }

  for (const [indicator, scope] of Object.entries(resourceScopesToGrant)) {
    grant.addResourceScope(indicator, scope.join(' '));
  }

  for (const [indicator, scope] of Object.entries(resourceScopesToReject)) {
    grant.rejectResourceScope(indicator, scope.join(' '));
  }

  const finalGrantId = await grant.save();
  const result = {
    consent: { grantId: finalGrantId },
  };

  // Configure consent
  return updateInteractionResult(
    ctx,
    provider,
    shouldMarkAppLevelAccessControlChecked
      ? markAppLevelAccessControlChecked(result, clientId, accountId)
      : result,
    true
  );
};
