import { type SsoConnectorMetadata } from '@logto/schemas';

import api from '#src/api/api.js';
import { getSignInExperience, updateSignInExperience } from '#src/api/sign-in-experience.js';
import { createSsoConnector, deleteSsoConnectorById } from '#src/api/sso-connector.js';
import { newOidcSsoConnectorPayload } from '#src/constants.js';
import { generateSsoConnectorName } from '#src/utils.js';

const { branding, domains } = newOidcSsoConnectorPayload;

const getEnabledSsoConnectors = async (email: string) =>
  api
    .get('experience/sso-connectors', { searchParams: { email } })
    .json<{ connectorIds: string[]; connectors: SsoConnectorMetadata[] }>();

describe('GET /api/experience/sso-connectors', () => {
  it('returns branded connectors only for a matching email domain', async () => {
    const { singleSignOnEnabled } = await getSignInExperience();
    const { id } = await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
    });

    try {
      await updateSignInExperience({ singleSignOnEnabled: true });

      const matchingResponse = await getEnabledSsoConnectors(`user@${domains[0]}`);

      expect(matchingResponse.connectorIds).toContain(id);
      expect(matchingResponse.connectors).toContainEqual({
        id,
        connectorName: branding.displayName,
        logo: branding.logo,
        darkLogo: branding.darkLogo,
      });

      const nonMatchingResponse = await getEnabledSsoConnectors('user@non-matching.invalid');

      expect(nonMatchingResponse).toEqual({ connectorIds: [], connectors: [] });
    } finally {
      await deleteSsoConnectorById(id);
      await updateSignInExperience({ singleSignOnEnabled });
    }
  });

  it('returns empty arrays when single sign-on is disabled', async () => {
    const { singleSignOnEnabled } = await getSignInExperience();
    await updateSignInExperience({ singleSignOnEnabled: false });

    try {
      await expect(getEnabledSsoConnectors(`user@${domains[0]}`)).resolves.toEqual({
        connectorIds: [],
        connectors: [],
      });
    } finally {
      await updateSignInExperience({ singleSignOnEnabled });
    }
  });
});
