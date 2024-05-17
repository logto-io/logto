import { defaults, parseAffiliateData } from '@logto/affiliate';
import { type CreateUser, type User, adminTenantId } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
import { type IRouterContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import { type ConnectorLibrary } from '#src/libraries/connector.js';
import { encryptUserPassword } from '#src/libraries/user.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { type OmitAutoSetFields } from '#src/utils/sql.js';

import {
  type Identifier,
  type SocialIdentifier,
  type VerifiedSignInInteractionResult,
  type VerifiedRegisterInteractionResult,
} from '../types/index.js';
import { categorizeIdentifiers } from '../utils/interaction.js';

const filterSocialIdentifiers = (identifiers: Identifier[]): SocialIdentifier[] =>
  identifiers.filter((identifier): identifier is SocialIdentifier => identifier.key === 'social');

/* Sync avatar and name from the latest social identity for existing users  */
const getSocialSyncProfile = async (
  { getLogtoConnectorById }: ConnectorLibrary,
  authIdentifiers: Identifier[]
) => {
  const socialIdentifier = filterSocialIdentifiers(authIdentifiers).at(-1);

  if (!socialIdentifier) {
    return;
  }

  const {
    userInfo: { name, avatar },
    connectorId,
  } = socialIdentifier;

  const {
    dbEntry: { syncProfile },
  } = await getLogtoConnectorById(connectorId);

  return conditional(
    syncProfile && {
      ...conditional(name && { name }),
      ...conditional(avatar && { avatar }),
    }
  );
};

/* Parse the user profile from the new linked Social identity */
const parseNewSocialProfile = async (
  { users: { hasUserWithEmail, hasUserWithPhone } }: Queries,
  { getLogtoConnectorById }: ConnectorLibrary,
  socialIdentifier: SocialIdentifier,
  user?: User
) => {
  const { connectorId, userInfo } = socialIdentifier;
  const { name, avatar, id, email, phone } = userInfo;

  const {
    metadata: { target },
    dbEntry: { syncProfile },
  } = await getLogtoConnectorById(connectorId);

  // Sync the social identity, merge the new social identity with the existing one
  const identities = { ...user?.identities, [target]: { userId: id, details: userInfo } };

  // Parse the profile for new user (register)
  if (!user) {
    return {
      identities,
      ...conditional(name && { name }),
      ...conditional(avatar && { avatar }),
      // Sync the email only if the email is not used by other users
      ...conditional(email && !(await hasUserWithEmail(email)) && { primaryEmail: email }),
      // Sync the phone only if the phone is not used by other users
      ...conditional(phone && !(await hasUserWithPhone(phone)) && { primaryPhone: phone }),
    };
  }

  // Sync the user name and avatar to the existing user if the connector has syncProfile enabled (sign-in)
  return {
    identities,
    ...conditional(
      syncProfile && {
        ...conditional(name && { name }),
        ...conditional(avatar && { avatar }),
      }
    ),
  };
};

/* Parse the user profile from the interaction result. */
export const parseUserProfile = async (
  { connectors, queries }: TenantContext,
  { profile, identifiers }: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult,
  user?: User
): Promise<Omit<OmitAutoSetFields<CreateUser>, 'id'>> => {
  const { authIdentifiers, profileIdentifiers } = categorizeIdentifiers(identifiers ?? [], profile);
  const { phone, username, email, connectorId, password } = profile ?? {};

  // Parse the new social profiles
  const socialProfileIdentifier = connectorId
    ? profileIdentifiers.find(
        (identifier): identifier is SocialIdentifier =>
          identifier.key === 'social' && identifier.connectorId === connectorId
      )
    : undefined;

  const newSocialProfile =
    socialProfileIdentifier &&
    (await parseNewSocialProfile(queries, connectors, socialProfileIdentifier, user));

  return {
    ...newSocialProfile,
    ...conditional(password && (await encryptUserPassword(password))),
    ...conditional(phone && { primaryPhone: phone }),
    ...conditional(email && { primaryEmail: email }),
    ...conditional(username && { username }),
    ...conditional(user && (await getSocialSyncProfile(connectors, authIdentifiers))),
    lastSignInAt: Date.now(),
  };
};

/* Post affiliate data to the cloud service. */
export const postAffiliateLogs = async (
  ctx: IRouterContext,
  cloudConnection: CloudConnectionLibrary,
  userId: string,
  tenantId: string
) => {
  if (!EnvSet.values.isCloud || tenantId !== adminTenantId) {
    return;
  }

  const affiliateData = trySafe(() =>
    parseAffiliateData(JSON.parse(decodeURIComponent(ctx.cookies.get(defaults.cookieName) ?? '')))
  );

  if (affiliateData) {
    const client = await cloudConnection.getClient();
    await client.post('/api/affiliate-logs', {
      body: { userId, ...affiliateData },
    });
    getConsoleLogFromContext(ctx).info('Affiliate logs posted', userId);
  }
};
