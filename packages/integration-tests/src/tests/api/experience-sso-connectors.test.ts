import { type SsoConnectorMetadata } from '@logto/schemas';

import api from '#src/api/api.js';
import { getSignInExperience, updateSignInExperience } from '#src/api/sign-in-experience.js';
import { createSsoConnector, deleteSsoConnectorById } from '#src/api/sso-connector.js';
import { newOidcSsoConnectorPayload } from '#src/constants.js';
import { initClient } from '#src/helpers/client.js';
import { generateSsoConnectorName } from '#src/utils.js';

const { branding, domains } = newOidcSsoConnectorPayload;

const getEnabledSsoConnectors = async (email: string, cookie: string) =>
  api
    .get('experience/sso-connectors', { searchParams: { email }, headers: { cookie } })
    .json<{ connectorIds: string[]; connectors: SsoConnectorMetadata[] }>();

describe('GET /api/experience/sso-connectors', () => {
  it('returns branded connectors only for a matching email domain', async () => {
    const client = await initClient();
    const { singleSignOnEnabled, ssoBrandingBeforeEmailMatch } = await getSignInExperience();
    const { id } = await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
    });

    try {
      // The email-domain lookup always returns branding for matched connectors, even when the
      // public sign-in experience hides it.
      await updateSignInExperience({
        singleSignOnEnabled: true,
        ssoBrandingBeforeEmailMatch: false,
      });

      const matchingResponse = await getEnabledSsoConnectors(
        `user@${domains[0]}`,
        client.interactionCookie
      );

      expect(matchingResponse.connectorIds).toContain(id);
      expect(matchingResponse.connectors).toContainEqual({
        id,
        connectorName: branding.displayName,
        logo: branding.logo,
        darkLogo: branding.darkLogo,
      });

      const nonMatchingResponse = await getEnabledSsoConnectors(
        'user@non-matching.invalid',
        client.interactionCookie
      );

      expect(nonMatchingResponse).toEqual({ connectorIds: [], connectors: [] });
    } finally {
      await deleteSsoConnectorById(id);
      await updateSignInExperience({ singleSignOnEnabled, ssoBrandingBeforeEmailMatch });
    }
  });

  it('returns empty arrays when single sign-on is disabled', async () => {
    const client = await initClient();
    const { singleSignOnEnabled } = await getSignInExperience();
    const { id } = await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
    });

    try {
      await updateSignInExperience({ singleSignOnEnabled: false });

      await expect(
        getEnabledSsoConnectors(`user@${domains[0]}`, client.interactionCookie)
      ).resolves.toEqual({
        connectorIds: [],
        connectors: [],
      });
    } finally {
      await deleteSsoConnectorById(id);
      await updateSignInExperience({ singleSignOnEnabled });
    }
  });
});
