import { ApplicationType } from '@logto/schemas';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import { HTTPError } from 'got';

import { createApplication, getApplication, updateApplication, deleteApplication } from '@/api';

describe('admin console application', () => {
  it('should get demo app details successfully', async () => {
    const demoApp = await getApplication(demoAppApplicationId);

    expect(demoApp.id).toBe(demoAppApplicationId);
  });

  it('should create application successfully', async () => {
    const applicationName = 'test-create-app';
    const applicationType = ApplicationType.SPA;

    const application = await createApplication(applicationName, applicationType);

    expect(application.name).toBe(applicationName);
    expect(application.type).toBe(applicationType);

    const fetchedApplication = await getApplication(application.id);

    expect(fetchedApplication.name).toBe(applicationName);
  });

  it('should update application details successfully', async () => {
    const application = await createApplication('test-update-app', ApplicationType.SPA);

    const newApplicationDescription = `new_${application.description ?? ''}`;

    const newRedirectUris = application.oidcClientMetadata.redirectUris.concat([
      'https://logto.dev/callback',
    ]);

    await updateApplication(application.id, {
      description: newApplicationDescription,
      oidcClientMetadata: {
        redirectUris: newRedirectUris,
      },
    });

    const updatedApplication = await getApplication(application.id);

    expect(updatedApplication.description).toBe(newApplicationDescription);
    expect(updatedApplication.oidcClientMetadata.redirectUris).toEqual(newRedirectUris);
  });

  it('should delete application successfully', async () => {
    const application = await createApplication('test-delete-app', ApplicationType.SPA);

    await deleteApplication(application.id);

    const response = await getApplication(application.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode === 404).toBe(true);
  });
});
