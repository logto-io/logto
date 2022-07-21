import { Application, ApplicationType } from '@logto/schemas';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';

import { authedAdminApi } from '@/api';

const createApplication = (name: string, type: ApplicationType) => {
  return authedAdminApi
    .post('applications', {
      json: {
        name,
        type,
      },
    })
    .json<Application>();
};

describe('admin console application', () => {
  it('should get demo app details successfully', async () => {
    const demoApp = await authedAdminApi
      .get(`applications/${demoAppApplicationId}`)
      .json<Application>();

    expect(demoApp.id).toBe(demoAppApplicationId);
  });

  it('should create application successfully', async () => {
    const applicationName = 'test-create-app';
    const applicationType = ApplicationType.SPA;

    const application = await createApplication(applicationName, applicationType);

    expect(application.name).toBe(applicationName);
    expect(application.type).toBe(applicationType);

    const fetchedApplication = await authedAdminApi
      .get(`applications/${application.id}`)
      .json<Application[]>();

    expect(fetchedApplication).toBeTruthy();
  });

  it('should update application details successfully', async () => {
    const application = await createApplication('test-update-app', ApplicationType.SPA);

    const newApplicationDescription = `new_${application.description ?? ''}`;

    const newRedirectUris = application.oidcClientMetadata.redirectUris.concat([
      'https://logto.dev/callback',
    ]);

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
    const application = await createApplication('test-delete-app', ApplicationType.SPA);

    await authedAdminApi.delete(`applications/${application.id}`);

    const fetchResponseAfterDeletion = await authedAdminApi.get(`applications/${application.id}`, {
      throwHttpErrors: false,
    });

    expect(fetchResponseAfterDeletion.statusCode).toBe(404);
  });
});
