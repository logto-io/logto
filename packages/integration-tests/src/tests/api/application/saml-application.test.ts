import { ApplicationType, BindingType } from '@logto/schemas';

import { createApplication, deleteApplication, updateApplication } from '#src/api/application.js';
import {
  createSamlApplication,
  deleteSamlApplication,
  updateSamlApplication,
  getSamlApplication,
  deleteSamlApplicationSecret,
  createSamlApplicationSecret,
  updateSamlApplicationSecret,
  getSamlApplicationSecrets,
  getSamlApplicationMetadata,
} from '#src/api/saml-application.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureTest } from '#src/utils.js';

const { it, describe } = devFeatureTest;

describe('SAML application', () => {
  it('should create and delete a SAML application successfully', async () => {
    const createdSamlApplication = await createSamlApplication({
      name: 'test',
      description: 'test',
    });

    await deleteSamlApplication(createdSamlApplication.id);
  });

  it('should not support HTTP-Redirect binding', async () => {
    await expectRejects(
      createSamlApplication({
        name: 'test',
        description: 'test',
        acsUrl: {
          binding: BindingType.Redirect,
          url: 'https://example.com',
        },
      }),
      {
        code: 'application.saml.acs_url_binding_not_supported',
        status: 422,
      }
    );
  });

  it('should be able to create SAML application with `config` field', async () => {
    const config = {
      entityId: 'https://example.logto.io',
      acsUrl: {
        binding: BindingType.Post,
        url: 'https://example.logto.io/sso/saml',
      },
    };
    const createdSamlApplication = await createSamlApplication({
      name: 'test',
      description: 'test',
      ...config,
    });
    expect(createdSamlApplication.entityId).toEqual(config.entityId);
    expect(createdSamlApplication.acsUrl).toEqual(config.acsUrl);
    await deleteSamlApplication(createdSamlApplication.id);
  });

  it('should be able to update SAML application and get the updated one', async () => {
    const createdSamlApplication = await createSamlApplication({
      name: 'test',
      description: 'test',
      entityId: 'http://example.logto.io/foo',
    });
    expect(createdSamlApplication.entityId).toEqual('http://example.logto.io/foo');
    expect(createdSamlApplication.acsUrl).toEqual(null);
    expect(createdSamlApplication.attributeMapping).toEqual({});

    const newConfig = {
      acsUrl: {
        binding: BindingType.Post,
        url: 'https://example.logto.io/sso/saml',
      },
      entityId: null,
    };
    const updatedSamlApplication = await updateSamlApplication(createdSamlApplication.id, {
      name: 'updated',
      ...newConfig,
    });
    expect(updatedSamlApplication.acsUrl).toEqual(newConfig.acsUrl);
    expect(updatedSamlApplication.entityId).toEqual(newConfig.entityId);
    expect(updatedSamlApplication.attributeMapping).toEqual({});

    const upToDateSamlApplication = await getSamlApplication(createdSamlApplication.id);

    expect(updatedSamlApplication).toEqual(upToDateSamlApplication);
    expect(updatedSamlApplication.name).toEqual('updated');
    expect(updatedSamlApplication.acsUrl).toEqual(newConfig.acsUrl);

    await deleteSamlApplication(updatedSamlApplication.id);
  });

  it('can not delete/update/get non-SAML applications with `DEL /saml-applications/:id` API', async () => {
    const application = await createApplication('test-non-saml-app', ApplicationType.Traditional, {
      isThirdParty: true,
    });

    await expectRejects(deleteSamlApplication(application.id), {
      code: 'application.saml.saml_application_only',
      status: 422,
    });
    await expectRejects(updateSamlApplication(application.id, { name: 'updated' }), {
      code: 'application.saml.saml_application_only',
      status: 422,
    });
    await expectRejects(getSamlApplication(application.id), {
      code: 'application.saml.saml_application_only',
      status: 422,
    });
    await deleteApplication(application.id);
  });
});

describe('SAML application secrets/certificate/metadata', () => {
  it('should create a secret and verify privateKey is not exposed', async () => {
    const { id } = await createSamlApplication({
      name: 'test',
      description: 'test',
    });

    const createdSecret = await createSamlApplicationSecret(id, 30);

    // @ts-expect-error - Make sure the `privateKey` is not exposed
    expect(createdSecret.privateKey).toBeUndefined();

    await expectRejects(updateApplication(id, { name: 'updated' }), {
      code: 'application.saml.use_saml_app_api',
      status: 400,
    });
    await expectRejects(deleteApplication(id), {
      code: 'application.saml.use_saml_app_api',
      status: 400,
    });
    await deleteSamlApplication(id);
  });

  it('should be able to get metadata after creating a SAML app', async () => {
    const { id } = await createSamlApplication({
      name: 'test',
      description: 'test',
    });

    await expect(getSamlApplicationMetadata(id)).resolves.not.toThrow();

    await deleteSamlApplication(id);
  });

  it('should manage secret activation status correctly', async () => {
    const { id } = await createSamlApplication({
      name: 'test',
      description: 'test',
    });

    const createdSecret = await createSamlApplicationSecret(id, 30);

    const updatedSecret = await updateSamlApplicationSecret(id, createdSecret.id, true);
    expect(updatedSecret.active).toBe(true);
    expect(typeof updatedSecret.certificate).toBe('string');

    const secrets = await getSamlApplicationSecrets(id);
    expect(secrets.length).toBe(2);
    expect(secrets.every(({ createdAt, expiresAt }) => createdAt < expiresAt)).toBe(true);
    expect(secrets.filter(({ active }) => active).length).toBe(1);

    await deleteSamlApplication(id);
  });

  it('should prevent deletion of active secrets', async () => {
    const { id } = await createSamlApplication({
      name: 'test',
      description: 'test',
    });

    const secret = await createSamlApplicationSecret(id, 30);
    await updateSamlApplicationSecret(id, secret.id, true);

    await expectRejects(deleteSamlApplicationSecret(id, secret.id), {
      code: 'application.saml.can_not_delete_active_secret',
      status: 400,
    });

    await updateSamlApplicationSecret(id, secret.id, false);

    await deleteSamlApplicationSecret(id, secret.id);

    await deleteSamlApplication(id);
  });
});
