import { GoogleConnector } from '@logto/connector-kit';
import { ExtraParamsKey } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

/**
 * Normalize the connector data for external website embedding Google One Tap.
 *
 * We apply transformation to the connector data when it is from external website embedding Google One Tap:
 * For built-in Google One Tap, we have `GoogleConnector.oneTapParams.csrfToken` and `GoogleConnector.oneTapParams.credential` keys;
 * while for external website Google One Tap, we have `GoogleConnector.oneTapParams.externalCredential` key.
 * We use this util method to transform the data to the format that the connector expects,
 * so that the connector can handle the data correctly.
 *
 * For now, this method is only used to normalize the Google One Tap data.
 *
 * @param data The connector data from external website embedding Google One Tap.
 * @returns The normalized data.
 */
export const normalizeExternalWebsiteGoogleOneTapConnectorData = (
  data: Record<string, string>
): Record<string, string> => {
  return {
    ...data,
    ...conditional(
      data[ExtraParamsKey.GoogleOneTapCredential] && {
        [GoogleConnector.oneTapParams.credential]: data[ExtraParamsKey.GoogleOneTapCredential],
      }
    ),
  };
};
