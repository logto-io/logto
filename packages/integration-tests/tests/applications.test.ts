import { Application } from '@logto/schemas';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';

import { authedAdminApi } from '@/api';

const testApplication = {
  id: '',
  name: 'test-app',
  type: 'SPA',
};

describe('admin console application', () => {
  it('should get demo app details successfully', async () => {
    const demoApp = await authedAdminApi
      .get(`applications/${demoAppApplicationId}`)
      .json<Application>();

    expect(demoApp.id).toBe(demoAppApplicationId);
  });

  it('should create application successfully', async () => {
    const application = await authedAdminApi
      .post('applications', {
        json: { name: testApplication.name, type: testApplication.type },
      })
      .json<Application>();

    expect(application.name).toBe(testApplication.name);
    expect(application.type).toBe(testApplication.type);

    // eslint-disable-next-line @silverhand/fp/no-mutation
    testApplication.id = application.id;

    const applications = await authedAdminApi.get('applications').json<Application[]>();

    expect(applications.some((app) => app.id === application.id)).toBeTruthy();
  });

  it('should update application details successfully', async () => {
    expect(testApplication.id).toBeTruthy();

    const application = await authedAdminApi
      .get(`applications/${testApplication.id}`)
      .json<Application>();

    const newApplicationDescription = 'new application description';
    expect(application.description).not.toBe(newApplicationDescription);

    const newRedirectUris = ['https://logto.dev/callback'];
    expect(application.oidcClientMetadata.redirectUris).not.toEqual(newRedirectUris);

    await authedAdminApi
      .patch(`applications/${application.id}`, {
        json: {
          description: newApplicationDescription,
          oidcClientMetadata: {
            redirectUris: newRedirectUris,
          },
        },
      })
      .json<Application>();

    const updatedApplication = await authedAdminApi
      .get(`applications/${application.id}`)
      .json<Application>();

    expect(updatedApplication.description).toBe(newApplicationDescription);
    expect(updatedApplication.oidcClientMetadata.redirectUris).toEqual(newRedirectUris);
  });

  it('should delete application successfully', async () => {
    expect(testApplication.id).toBeTruthy();

    await authedAdminApi.delete(`applications/${testApplication.id}`);

    const applications = await authedAdminApi.get('applications').json<Application[]>();

    const hasTestApplication = applications.some((app) => app.id === testApplication.id);
    expect(hasTestApplication).toBeFalsy();
  });
});
