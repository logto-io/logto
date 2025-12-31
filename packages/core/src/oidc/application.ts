import { CustomClientMetadataKey } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import type Queries from '#src/tenants/Queries.js';

/**
 * Validate if an application is allowed to perform token exchange.
 *
 * Returns an error message if the application is not allowed, otherwise returns undefined.
 */
export const getTokenExchangeValidationError = async (
  { applications }: Queries,
  applicationId: string
): Promise<string | undefined> => {
  // Note: Demo-app (with a fixed app ID "demo-app") does not exist in the database
  const application = await trySafe(async () => applications.findApplicationById(applicationId));

  // Third-party applications are not allowed to perform token exchange
  if (application?.isThirdParty) {
    return 'third-party applications are not allowed for this grant type';
  }

  /**
   * Note: For demo-app, `allowTokenExchange` will be `undefined` because the application
   * does not exist. Since it cannot be controlled via Console UI, it's forbidden to prevent abuse.
   */
  const allowTokenExchange =
    application?.customClientMetadata[CustomClientMetadataKey.AllowTokenExchange];

  if (allowTokenExchange !== true) {
    return 'token exchange is not allowed for this application';
  }

  return undefined;
};
