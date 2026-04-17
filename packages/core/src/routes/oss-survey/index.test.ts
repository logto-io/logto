import { CompanySize, Project } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import request from 'supertest';

import { EnvSet } from '#src/env-set/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { reportOssSurvey } = await mockEsmWithActual('#src/libraries/oss-survey.js', () => ({
  reportOssSurvey: jest.fn(),
}));

const initApis = await pickDefault(import('../init.js'));
const createApiRequester = () => request(initApis(new MockTenant()).callback());
const createAuthedRequester = () =>
  createRequester({
    authedRoutes: ossSurveyRoutes,
    tenantContext: new MockTenant(),
  });
const ossSurveyRoutes = await pickDefault(import('./index.js'));

describe('ossSurveyRoutes', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const setDevFeaturesEnabled = (enabled: boolean) => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', enabled);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('requires management auth when dev features are enabled', async () => {
    setDevFeaturesEnabled(true);
    const requester = createApiRequester();

    const response = await requester.post('/oss-survey/report').send({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Company,
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });

    expect(response.status).toBe(401);
    expect(reportOssSurvey).not.toHaveBeenCalled();
  });

  it('reports the survey payload when the management route is accessed with auth', async () => {
    setDevFeaturesEnabled(true);
    const requester = createAuthedRequester();

    const response = await requester.post('/oss-survey/report').send({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Company,
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });

    expect(response.status).toBe(204);
    expect(reportOssSurvey).toHaveBeenCalledWith({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Company,
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });
  });

  it('rejects invalid payloads before calling the reporter when dev features are enabled', async () => {
    setDevFeaturesEnabled(true);
    const requester = createAuthedRequester();
    const response = await requester.post('/oss-survey/report').send({
      emailAddress: 'not-an-email',
      project: Project.Personal,
    });

    expect(response.status).toBe(400);
    expect(reportOssSurvey).not.toHaveBeenCalled();
  });

  it('keeps the old flow by not exposing the OSS survey route when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);
    const requester = createApiRequester();

    const response = await requester.post('/oss-survey/report').send({
      emailAddress: 'dev@example.com',
      project: Project.Personal,
    });

    expect(response.status).toBe(404);
    expect(reportOssSurvey).not.toHaveBeenCalled();
  });
});
