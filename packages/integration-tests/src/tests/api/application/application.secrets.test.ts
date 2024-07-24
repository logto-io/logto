import { ApplicationType, type Application } from '@logto/schemas';
import { cond, noop } from '@silverhand/essentials';
import { HTTPError } from 'ky';

import {
  createApplication as createApplicationApi,
  createApplicationSecret,
  deleteApplication,
  deleteApplicationSecret,
  getApplicationSecrets,
} from '#src/api/application.js';
import { devFeatureTest, randomString } from '#src/utils.js';

devFeatureTest.describe('application secrets', () => {
  const applications: Application[] = [];
  const createApplication = async (...args: Parameters<typeof createApplicationApi>) => {
    const created = await createApplicationApi(...args);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    applications.push(created);
    return created;
  };

  afterAll(async () => {
    await Promise.all(applications.map(async ({ id }) => deleteApplication(id).catch(noop)));
  });

  it.each(Object.values(ApplicationType))(
    'should or not to create application secret for %s applications per type',
    async (type) => {
      const application = await createApplication(
        'application',
        type,
        cond(
          type === ApplicationType.Protected && {
            protectedAppMetadata: {
              origin: 'https://example.com',
              subDomain: randomString(),
            },
          }
        )
      );
      const secretName = randomString();
      const secretPromise = createApplicationSecret({
        applicationId: application.id,
        name: secretName,
      });

      if (
        [
          ApplicationType.MachineToMachine,
          ApplicationType.Protected,
          ApplicationType.Traditional,
        ].includes(type)
      ) {
        expect(await secretPromise).toEqual(
          expect.objectContaining({ applicationId: application.id, name: secretName })
        );
      } else {
        const response = await secretPromise.catch((error: unknown) => error);
        expect(response).toBeInstanceOf(HTTPError);
        expect(response).toHaveProperty('response.status', 422);
        expect(await (response as HTTPError).response.json()).toHaveProperty(
          'code',
          'entity.db_constraint_violated'
        );
      }
    }
  );

  it('should throw error when creating application secret with existing name', async () => {
    const application = await createApplication('application', ApplicationType.MachineToMachine);
    const secretName = randomString();
    await createApplicationSecret({ applicationId: application.id, name: secretName });

    const response = await createApplicationSecret({
      applicationId: application.id,
      name: secretName,
    }).catch((error: unknown) => error);

    expect(response).toBeInstanceOf(HTTPError);
    expect(response).toHaveProperty('response.status', 422);
    expect(await (response as HTTPError).response.json()).toHaveProperty(
      'code',
      'application.secret_name_exists'
    );
  });

  it('should throw error when creating application secret with invalid application id', async () => {
    const secretName = randomString();
    const response = await createApplicationSecret({
      applicationId: 'invalid',
      name: secretName,
    }).catch((error: unknown) => error);

    expect(response).toBeInstanceOf(HTTPError);
    expect(response).toHaveProperty('response.status', 404);
  });

  it('should throw error when creating application secret with empty name', async () => {
    const application = await createApplication('application', ApplicationType.MachineToMachine);
    const response = await createApplicationSecret({
      applicationId: application.id,
      name: '',
    }).catch((error: unknown) => error);

    expect(response).toBeInstanceOf(HTTPError);
    expect(response).toHaveProperty('response.status', 400);
  });

  it('should throw error when creating application secret with invalid expiresAt', async () => {
    const application = await createApplication('application', ApplicationType.MachineToMachine);
    const secretName = randomString();
    const response = await createApplicationSecret({
      applicationId: application.id,
      name: secretName,
      expiresAt: Date.now() - 1000,
    }).catch((error: unknown) => error);

    expect(response).toBeInstanceOf(HTTPError);
    expect(response).toHaveProperty('response.status', 400);
  });

  it('should be able to create, get, and delete multiple application secrets', async () => {
    const application = await createApplication('application', ApplicationType.MachineToMachine);
    const secretName1 = randomString();
    const secretName2 = randomString();
    const secret1 = await createApplicationSecret({
      applicationId: application.id,
      name: secretName1,
      expiresAt: Date.now() + 1000,
    });
    const secret2 = await createApplicationSecret({
      applicationId: application.id,
      name: secretName2,
    });

    expect(await getApplicationSecrets(application.id)).toEqual(
      expect.arrayContaining([secret1, secret2])
    );
    await deleteApplicationSecret(application.id, secretName1);
    await deleteApplicationSecret(application.id, secretName2);
    expect(await getApplicationSecrets(application.id)).toEqual([]);
  });
});
