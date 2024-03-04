import { LogtoJwtTokenKey } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import { pick } from '@silverhand/essentials';
import Sinon from 'sinon';

import {
  mockLogtoConfigRows,
  mockJwtCustomizerConfigForAccessToken,
  mockJwtCustomizerConfigForClientCredentials,
} from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const logtoConfigQueries = {
  getRowsByKeys: jest.fn(async () => mockLogtoConfigRows),
  deleteJwtCustomizer: jest.fn(),
};

const logtoConfigLibraries = {
  upsertJwtCustomizer: jest.fn(),
  getJwtCustomizer: jest.fn(),
  getJwtCustomizers: jest.fn(),
  updateJwtCustomizer: jest.fn(),
};

const settingRoutes = await pickDefault(import('./index.js'));

describe('configs JWT customizer routes', () => {
  const tenantContext = new MockTenant(undefined, { logtoConfigs: logtoConfigQueries });
  Sinon.stub(tenantContext, 'logtoConfigs').value(logtoConfigLibraries);

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
    logtoConfigLibraries.upsertJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken
    );
    const response = await routeRequester
      .put(`/configs/jwt-customizer/access-token`)
      .send(mockJwtCustomizerConfigForAccessToken.value);
    expect(logtoConfigLibraries.upsertJwtCustomizer).toHaveBeenCalledWith(
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
    logtoConfigLibraries.upsertJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken
    );
    const response = await routeRequester
      .put('/configs/jwt-customizer/access-token')
      .send(mockJwtCustomizerConfigForAccessToken.value);
    expect(logtoConfigLibraries.upsertJwtCustomizer).toHaveBeenCalledWith(
      LogtoJwtTokenKey.AccessToken,
      mockJwtCustomizerConfigForAccessToken.value
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('PATCH /configs/jwt-customizer/:tokenType should update a record successfully', async () => {
    logtoConfigLibraries.updateJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken.value
    );
    const response = await routeRequester
      .patch('/configs/jwt-customizer/access-token')
      .send(mockJwtCustomizerConfigForAccessToken.value);
    expect(logtoConfigLibraries.updateJwtCustomizer).toHaveBeenCalledWith(
      LogtoJwtTokenKey.AccessToken,
      mockJwtCustomizerConfigForAccessToken.value
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('GET /configs/jwt-customizer should return all records', async () => {
    logtoConfigLibraries.getJwtCustomizers.mockResolvedValueOnce({
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
    logtoConfigLibraries.getJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken.value
    );
    const response = await routeRequester.get('/configs/jwt-customizer/access-token');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('DELETE /configs/jwt-customizer/:tokenType should delete the record', async () => {
    const response = await routeRequester.delete('/configs/jwt-customizer/client-credentials');
    expect(logtoConfigQueries.deleteJwtCustomizer).toHaveBeenCalledWith(
      LogtoJwtTokenKey.ClientCredentials
    );
    expect(response.status).toEqual(204);
  });
});
