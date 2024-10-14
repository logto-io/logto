import {
  ApplicationType,
  type SsoSamlAssertionContent,
  type CreateSsoConnectorIdpInitiatedAuthConfig,
  type SupportedSsoConnector,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assert } from '@silverhand/essentials';

import { defaultIdPInitiatedSamlSsoSessionTtl } from '#src/constants/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { isSupportedSsoConnector } from '#src/sso/utils.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { type OmitAutoSetFields } from '#src/utils/sql.js';

export type SsoConnectorLibrary = ReturnType<typeof createSsoConnectorLibrary>;

export const createSsoConnectorLibrary = (queries: Queries) => {
  const { ssoConnectors, applications } = queries;

  const getSsoConnectors = async (
    limit?: number,
    offset?: number
  ): Promise<[number, readonly SupportedSsoConnector[]]> => {
    const [count, entities] = await ssoConnectors.findAll(limit, offset);

    return [
      count,
      entities.filter((connector): connector is SupportedSsoConnector =>
        isSupportedSsoConnector(connector)
      ),
    ];
  };

  const getAvailableSsoConnectors = async () => {
    const [_, connectors] = await getSsoConnectors();

    return connectors.filter(({ providerName, config, domains }) => {
      const factory = ssoConnectorFactories[providerName];
      const hasValidConfig = factory.configGuard.safeParse(config).success;
      const hasValidDomains = domains.length > 0;

      return hasValidConfig && hasValidDomains;
    });
  };

  const getSsoConnectorById = async (id: string) => {
    const connector = await ssoConnectors.findById(id);

    // Return 404 if the connector is not supported
    assert(
      isSupportedSsoConnector(connector),
      new RequestError({
        code: 'connector.not_found',
        status: 404,
      })
    );

    return connector;
  };

  /**
   * Creates a new IdP-initiated authentication configuration for a SSO connector.
   *
   * @throws {RequestError} Throws a 404 error if the application is not found
   * @throws {RequestError} Throws a 400 error if the application is not a first-party traditional web application
   */
  const createSsoConnectorIdpInitiatedAuthConfig = async (
    data: OmitAutoSetFields<CreateSsoConnectorIdpInitiatedAuthConfig>
  ) => {
    const { defaultApplicationId } = data;

    // Throws an 404 error if the application is not found
    const application = await applications.findApplicationById(defaultApplicationId);

    assertThat(
      application.type === ApplicationType.Traditional && !application.isThirdParty,
      new RequestError('connector.saml_idp_initiated_auth_invalid_application_type')
    );

    return ssoConnectors.insertIdpInitiatedAuthConfig(data);
  };

  const updateSsoConnectorIdpInitiatedAuthConfig = async (
    connectorId: string,
    set: Pick<
      Partial<CreateSsoConnectorIdpInitiatedAuthConfig>,
      'defaultApplicationId' | 'redirectUri' | 'authParameters'
    >
  ) => {
    const { defaultApplicationId } = set;

    if (defaultApplicationId) {
      // Throws an 404 error if the application is not found
      const application = await applications.findApplicationById(defaultApplicationId);

      assertThat(
        application.type === ApplicationType.Traditional && !application.isThirdParty,
        new RequestError('connector.saml_idp_initiated_auth_invalid_application_type')
      );
    }

    return ssoConnectors.updateIdpInitiatedAuthConfig({
      set,
      where: { connectorId },
      jsonbMode: 'replace',
    });
  };

  /**
   * Records the verified SAML assertion content to the database.
   * @remarks
   * For IdP-initiated SAML SSO flow use only.
   * Save the SAML assertion content to the database
   * The session ID will be used to retrieve the SAML assertion content when the user is redirected to Logto SSO authentication flow.
   */
  const createIdpInitiatedSamlSsoSession = async (
    connectorId: string,
    assertionContent: SsoSamlAssertionContent
  ) => {
    // If the assertion has a notOnOrAfter condition, we will use it as the expiration date,
    // otherwise use the creation date + 10 minutes
    const expiresAt = assertionContent.conditions?.notOnOrAfter
      ? new Date(assertionContent.conditions.notOnOrAfter)
      : new Date(Date.now() + defaultIdPInitiatedSamlSsoSessionTtl);

    return ssoConnectors.insertIdpInitiatedSamlSsoSession({
      id: generateStandardId(),
      connectorId,
      assertionContent,
      expiresAt: expiresAt.valueOf(),
    });
  };

  return {
    getSsoConnectors,
    getAvailableSsoConnectors,
    getSsoConnectorById,
    createSsoConnectorIdpInitiatedAuthConfig,
    updateSsoConnectorIdpInitiatedAuthConfig,
    createIdpInitiatedSamlSsoSession,
  };
};
