import {
  MfaPolicy,
  OrganizationRequiredMfaPolicy,
  userMfaDataGuard,
  userMfaDataKey,
  type Mfa,
  type Organization,
  type User,
} from '@logto/schemas';
import { z } from 'zod';

import type Queries from '#src/tenants/Queries.js';

export const isNoSkipMfaPolicy = (policy: MfaPolicy): boolean =>
  [
    MfaPolicy.Mandatory,
    MfaPolicy.PromptAtSignInAndSignUpMandatory,
    MfaPolicy.PromptOnlyAtSignInMandatory,
  ].includes(policy);

export const isPromptOnlyAtSignInPolicy = (policy: MfaPolicy): boolean =>
  [MfaPolicy.PromptOnlyAtSignIn, MfaPolicy.PromptOnlyAtSignInMandatory].includes(policy);

/**
 * Whether MFA is required for the user, either by an explicit per-user requirement or by an
 * organization that requires MFA. A required user can neither skip MFA binding nor opt out of
 * MFA verification on sign-in.
 *
 * The per-user requirement is independent of `organizationRequiredMfaPolicy`. When no MFA factor
 * is enabled in the sign-in experience, there is nothing to enforce.
 *
 * @param organizations The user's organizations, if already resolved; queried otherwise.
 */
export const isMfaRequiredByUser = async (
  queries: Queries,
  mfaSettings: Mfa,
  user: Pick<User, 'id' | 'logtoConfig'>,
  organizations?: ReadonlyArray<Pick<Organization, 'isMfaRequired'>>
): Promise<boolean> => {
  if (mfaSettings.factors.length === 0) {
    return false;
  }

  const parsed = z.object({ [userMfaDataKey]: userMfaDataGuard }).safeParse(user.logtoConfig);

  if (parsed.success && parsed.data[userMfaDataKey].required === true) {
    return true;
  }

  if (mfaSettings.organizationRequiredMfaPolicy !== OrganizationRequiredMfaPolicy.Mandatory) {
    return false;
  }

  const resolvedOrganizations =
    organizations ??
    (await queries.organizations.relations.users.getOrganizationsByUserId(user.id));

  return resolvedOrganizations.some(({ isMfaRequired }) => isMfaRequired);
};
