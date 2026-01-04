import { CustomClientMetadataKey } from '@logto/schemas';
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
  const errorMessage = 'token exchange is not allowed for this application';

  const application = await trySafe(async () => applications.findApplicationById(applicationId));

  /**
   * Note: Built-in applications (demo-app, account-center) do not exist in the database,
   * so `application` will be undefined for them. Since they are not allowed to perform
   * token exchange, the undefined case will be handled by the `allowTokenExchange` check below.
   */
  if (!application) {
    return errorMessage;
  }

  // Third-party applications are not allowed to perform token exchange
  if (application.isThirdParty) {
    return 'third-party applications are not allowed for this grant type';
  }

  if (application.customClientMetadata[CustomClientMetadataKey.AllowTokenExchange] !== true) {
    return errorMessage;
  }

  return undefined;
};
