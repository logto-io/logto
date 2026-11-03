import { ApplicationType, isCimdClientId } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import type Queries from '#src/tenants/Queries.js';

/**
 * Whether the experience should show the "Continue to app" page for this application, i.e. it is a
 * native app with `showContinueToAppPage` enabled. The experience cannot tell this by itself,
 * because the user agent of iOS `ASWebAuthenticationSession` is the same as Safari's.
 *
 * CIMD clients are not stored in the applications table, so they are skipped.
 */
export const findIsContinueToAppPageEnabled = async (
  { applications: { findApplicationById } }: Queries,
  appId?: string
): Promise<boolean> => {
  if (!appId || isCimdClientId(appId)) {
    return false;
  }

  const application = await trySafe(findApplicationById(appId));

  return (
    application?.type === ApplicationType.Native &&
    application.customClientMetadata.showContinueToAppPage === true
  );
};
