import {
  LogtoJwtTokenKey,
  LogtoJwtTokenKeyType,
  type JwtCustomizerTestRequestBody,
} from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import { pickDefault } from '@logto/shared/esm';
import { pick } from '@silverhand/essentials';

import {
  mockJwtCustomizerConfigForAccessToken,
  mockJwtCustomizerConfigForClientCredentials,
  mockLogtoConfigRows,
} from '#src/__mocks__/index.js';
import { mockCloudClient, mockLogtoConfigsLibrary } from '#src/test-utils/mock-libraries.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const logtoConfigQueries = {
  getRowsByKeys: jest.fn(async () => mockLogtoConfigRows),
  deleteJwtCustomizer: jest.fn(),
};

const settingRoutes = await pickDefault(import('./index.js'));

describe('configs JWT customizer routes', () => {
  const tenantContext = new MockTenant(
    undefined,
    { logtoConfigs: logtoConfigQueries },
    undefined,
    {
      jwtCustomizers: {
        deployJwtCustomizerScript: jest.fn(),
        undeployJwtCustomizerScript: jest.fn(),
      },
    },
    mockLogtoConfigsLibrary
  );

  const routeRequester = createRequester({
    authedRoutes: settingRoutes,
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('PUT /configs/jwt-customizer/:tokenType should add a record successfully', async () => {
    logtoConfigQueries.getRowsByKeys.mockResolvedValueOnce({
      ...mockLogtoConfigRows,
      rows: [],
      rowCount: 0,
    });
    mockLogtoConfigsLibrary.upsertJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken
    );
    const response = await routeRequester
      .put(`/configs/jwt-customizer/access-token`)
      .send(mockJwtCustomizerConfigForAccessToken.value);

    expect(tenantContext.libraries.jwtCustomizers.deployJwtCustomizerScript).toHaveBeenCalledWith(
      expect.any(ConsoleLog),
      {
        key: LogtoJwtTokenKey.AccessToken,
        value: mockJwtCustomizerConfigForAccessToken.value,
        useCase: 'production',
      }
    );

    expect(mockLogtoConfigsLibrary.upsertJwtCustomizer).toHaveBeenCalledWith(
      LogtoJwtTokenKey.AccessToken,
      mockJwtCustomizerConfigForAccessToken.value
    );
    expect(response.status).toEqual(201);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('PUT /configs/jwt-customizer/:tokenType should update a record successfully', async () => {
    logtoConfigQueries.getRowsByKeys.mockResolvedValueOnce({
      ...mockLogtoConfigRows,
      rows: [mockJwtCustomizerConfigForAccessToken],
      rowCount: 1,
    });
    mockLogtoConfigsLibrary.upsertJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken
    );
    const response = await routeRequester
      .put('/configs/jwt-customizer/access-token')
      .send(mockJwtCustomizerConfigForAccessToken.value);
    expect(mockLogtoConfigsLibrary.upsertJwtCustomizer).toHaveBeenCalledWith(
      LogtoJwtTokenKey.AccessToken,
      mockJwtCustomizerConfigForAccessToken.value
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('PATCH /configs/jwt-customizer/:tokenType should update a record successfully', async () => {
    mockLogtoConfigsLibrary.updateJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken.value
    );
    const response = await routeRequester
      .patch('/configs/jwt-customizer/access-token')
      .send(mockJwtCustomizerConfigForAccessToken.value);

    expect(tenantContext.libraries.jwtCustomizers.deployJwtCustomizerScript).toHaveBeenCalledWith(
      expect.any(ConsoleLog),
      {
        key: LogtoJwtTokenKey.AccessToken,
        value: mockJwtCustomizerConfigForAccessToken.value,
        useCase: 'production',
      }
    );

    expect(mockLogtoConfigsLibrary.updateJwtCustomizer).toHaveBeenCalledWith(
      LogtoJwtTokenKey.AccessToken,
      mockJwtCustomizerConfigForAccessToken.value
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('GET /configs/jwt-customizer should return all records', async () => {
    mockLogtoConfigsLibrary.getJwtCustomizers.mockResolvedValueOnce({
      [LogtoJwtTokenKey.AccessToken]: mockJwtCustomizerConfigForAccessToken.value,
      [LogtoJwtTokenKey.ClientCredentials]: mockJwtCustomizerConfigForClientCredentials.value,
    });
    const response = await routeRequester.get('/configs/jwt-customizer');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      pick(mockJwtCustomizerConfigForAccessToken, 'key', 'value'),
      pick(mockJwtCustomizerConfigForClientCredentials, 'key', 'value'),
    ]);
  });

  it('GET /configs/jwt-customizer/:tokenType should return the record', async () => {
    mockLogtoConfigsLibrary.getJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken.value
    );
    const response = await routeRequester.get('/configs/jwt-customizer/access-token');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('DELETE /configs/jwt-customizer/:tokenType should delete the record', async () => {
    const response = await routeRequester.delete('/configs/jwt-customizer/client-credentials');
    expect(tenantContext.libraries.jwtCustomizers.undeployJwtCustomizerScript).toHaveBeenCalledWith(
      expect.any(ConsoleLog),
      LogtoJwtTokenKey.ClientCredentials
    );
    expect(logtoConfigQueries.deleteJwtCustomizer).toHaveBeenCalledWith(
      LogtoJwtTokenKey.ClientCredentials
    );
    expect(response.status).toEqual(204);
  });

  it('POST /configs/jwt-customizer/test should return 200', async () => {
    const cloudConnectionResponse = { success: true };
    jest.spyOn(tenantContext.cloudConnection, 'getClient').mockResolvedValue(mockCloudClient);
    jest.spyOn(mockCloudClient, 'post').mockResolvedValue(cloudConnectionResponse);

    const payload: JwtCustomizerTestRequestBody = {
      tokenType: LogtoJwtTokenKeyType.ClientCredentials,
      script: mockJwtCustomizerConfigForClientCredentials.value.script,
      environmentVariables: mockJwtCustomizerConfigForClientCredentials.value.environmentVariables,
      token: {},
    };

    const response = await routeRequester.post('/configs/jwt-customizer/test').send(payload);

    expect(tenantContext.libraries.jwtCustomizers.deployJwtCustomizerScript).toHaveBeenCalledWith(
      expect.any(ConsoleLog),
      {
        key: LogtoJwtTokenKey.ClientCredentials,
        value: payload,
        useCase: 'test',
      }
    );

    expect(mockCloudClient.post).toHaveBeenCalledWith('/api/services/custom-jwt', {
      body: payload,
      search: {
        isTest: 'true',
      },
    });

    expect(response.status).toEqual(200);
  });
});
