import { ConnectorType } from '@logto/connector-kit';
import { pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

import { mockConnector, mockMetadata, mockLogtoConnector } from '../__mocks__/connector.js';

const { jest } = import.meta;

const validateSamlAssertion = jest.fn();

const mockSamlLogtoConnector = {
  dbEntry: { ...mockConnector, connectorId: 'saml', id: 'saml_connector' },
  metadata: { ...mockMetadata, isStandard: true, id: 'saml', target: 'saml' },
  type: ConnectorType.Social,
  ...mockLogtoConnector,
  validateSamlAssertion,
};

const socialsLibraries = {
  getConnector: jest.fn(async (connectorId: string) => {
    if (connectorId !== 'saml_connector') {
      throw new RequestError({
        code: 'entity.not_found',
        connectorId,
        status: 404,
      });
    }

    return mockSamlLogtoConnector;
  }),
};

const baseProviderMock = {
  params: {},
  jti: 'jti',
  client_id: 'client_id',
};

const samlAssertionHandlerRoutes = await pickDefault(import('./saml-assertion-handler.js'));
const tenantContext = new MockTenant(
  createMockProvider(jest.fn().mockResolvedValue(baseProviderMock)),
  undefined,
  { socials: socialsLibraries }
);

describe('samlAssertionHandlerRoutes', () => {
  const assertionHandlerRequest = createRequester({
    anonymousRoutes: samlAssertionHandlerRoutes,
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /saml-assertion-handler/non_saml_connector should throw 404', async () => {
    const response = await assertionHandlerRequest.post(
      '/saml-assertion-handler/non_saml_connector'
    );
    expect(response.status).toEqual(404);
  });

  it('POST /saml-assertion-handler/saml_connector should throw when `RelayState` missing', async () => {
    const response = await assertionHandlerRequest
      .post('/saml-assertion-handler/saml_connector')
      .send({
        SAMLResponse: 'saml_response',
      });
    expect(response.status).toEqual(500);
  });

  it('POST /saml-assertion-handler/saml_connector', async () => {
    await assertionHandlerRequest.post('/saml-assertion-handler/saml_connector').send({
      SAMLResponse: 'saml_response',
      RelayState: 'relay_state',
    });
    expect(validateSamlAssertion).toHaveBeenCalledWith(
      { body: { RelayState: 'relay_state', SAMLResponse: 'saml_response' } },
      expect.anything(),
      expect.anything()
    );
  });
});
