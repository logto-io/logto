import { CustomClientMetadataKey, isBuiltInApplicationId } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import type Queries from '#src/tenants/Queries.js';

/**
 * Validate if an application is allowed to perform token exchange.
 *
 * Returns an error message if the application is not allowed, otherwise returns undefined.
 */
export const validateTokenExchangeAccess = async (
  { applications }: Queries,
  applicationId: string
): Promise<string | undefined> => {
  const tokenExchangeDisabledErrorMessage = 'token exchange is not allowed for this application';

  // Built-in applications (demo-app, account center) are not allowed to perform token exchange
  if (isBuiltInApplicationId(applicationId)) {
    return tokenExchangeDisabledErrorMessage;
  }

  const application = await trySafe(async () => applications.findApplicationById(applicationId));

  // Third-party applications are not allowed to perform token exchange
  if (application?.isThirdParty) {
    return 'third-party applications are not allowed for this grant type';
  }

  const allowTokenExchange =
    application?.customClientMetadata[CustomClientMetadataKey.AllowTokenExchange];

  if (allowTokenExchange !== true) {
    return tokenExchangeDisabledErrorMessage;
  }

  return undefined;
};
