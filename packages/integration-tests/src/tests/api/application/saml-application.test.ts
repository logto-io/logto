import { ApplicationType, BindingType, NameIdFormat } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import {
  createApplication,
  deleteApplication,
  getApplications,
  getApplication,
  updateApplication,
} from '#src/api/application.js';
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

    await expect(getApplication(createdSamlApplication.id)).resolves.toMatchObject(
      expect.objectContaining({
        oidcClientMetadata: {
          redirectUris: [],
          postLogoutRedirectUris: [],
        },
      })
    );

    expect(createdSamlApplication.nameIdFormat).toBe(NameIdFormat.Persistent);

    // Check if the SAML application's OIDC metadata redirect URI is properly set.
    // We need to do this since we do not return OIDC related info when using SAML app APIs.
    const samlApplications = await getApplications([ApplicationType.SAML]);
    expect(samlApplications.every(({ type }) => type === ApplicationType.SAML));
    const pickedSamlApplication = samlApplications.find(
      ({ id }) => id === createdSamlApplication.id
    );
    expect(pickedSamlApplication).toBeDefined();
    expect(
      samlApplications.every(
        ({ oidcClientMetadata: { redirectUris, postLogoutRedirectUris } }) =>
          redirectUris.length === 0 && postLogoutRedirectUris.length === 0
      )
    ).toBe(true);

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
      nameIdFormat: NameIdFormat.EmailAddress,
      encryption: {
        encryptAssertion: true,
        certificate:
          '-----BEGIN CERTIFICATE-----\nMIIDDTCCAfWgAwIBAgI...\n-----END CERTIFICATE-----\n',
        encryptThenSign: false,
      },
    };
    const createdSamlApplication = await createSamlApplication({
      name: 'test',
      description: 'test',
      ...config,
    });

    expect(createdSamlApplication.entityId).toEqual(config.entityId);
    expect(createdSamlApplication.acsUrl).toEqual(config.acsUrl);
    expect(createdSamlApplication.nameIdFormat).toEqual(config.nameIdFormat);
    expect(createdSamlApplication.encryption).toEqual(config.encryption);

    await deleteSamlApplication(createdSamlApplication.id);
  });

  it.each([
    {
      name: 'Update with ACS URL only',
      config: {
        acsUrl: {
          binding: BindingType.Post,
          url: 'https://example.logto.io/sso/saml',
        },
        entityId: null,
      },
    },
    {
      name: 'Update with Entity ID only',
      config: {
        acsUrl: null,
        entityId: 'https://example.logto.io/new-entity',
      },
    },
    {
      config: {
        acsUrl: {
          binding: BindingType.Post,
          url: 'https://example.logto.io/sso/saml2',
        },
        entityId: 'https://example.logto.io/entity2',
      },
    },
    {
      name: 'Update with null values and attribute mapping',
      config: {
        acsUrl: null,
        entityId: null,
        attributeMapping: {
          sub: 'sub',
          preferred_username: 'username',
          email: 'email_address',
        },
      },
    },
    {
      name: 'Update with minimal attribute mapping',
      config: {
        attributeMapping: {
          sub: 'sub',
        },
      },
    },
    {
      name: 'Update with empty attribute mapping',
      config: {
        attributeMapping: {},
      },
    },
  ])('should update SAML application - %#', async ({ name, config }) => {
    const formattedName = name ? `updated-${name}` : undefined;
    const initConfig = {
      name: 'test',
      description: 'test',
      entityId: 'http://example.logto.io/foo',
    };
    // Create initial SAML application
    const createdSamlApplication = await createSamlApplication(initConfig);

    expect(createdSamlApplication.entityId).toEqual(initConfig.entityId);
    // Default values
    expect(createdSamlApplication.acsUrl).toEqual(null);
    expect(createdSamlApplication.attributeMapping).toEqual({});
    expect(createdSamlApplication.nameIdFormat).toEqual(NameIdFormat.Persistent);
    expect(createdSamlApplication.encryption).toBe(null);

    // Update application with new config
    const updatedSamlApplication = await updateSamlApplication(createdSamlApplication.id, {
      ...conditional(name && { name: formattedName }),
      ...config,
    });

    // Verify update was successful
    if (config.acsUrl) {
      expect(updatedSamlApplication.acsUrl).toEqual(config.acsUrl);
    } else {
      expect(updatedSamlApplication.acsUrl).toBe(null);
    }

    if (config.entityId) {
      expect(updatedSamlApplication.entityId).toEqual(config.entityId);
    } else {
      expect(updatedSamlApplication.entityId).toBe(
        config.entityId === null ? null : initConfig.entityId
      );
    }

    if (config.attributeMapping) {
      expect(updatedSamlApplication.attributeMapping).toEqual(config.attributeMapping);
    } else {
      expect(updatedSamlApplication.attributeMapping).toEqual({});
    }

    if (name) {
      expect(updatedSamlApplication.name).toEqual(formattedName);
    } else {
      expect(updatedSamlApplication.name).toEqual(initConfig.name);
    }

    // Verify get returns same data
    const upToDateSamlApplication = await getSamlApplication(createdSamlApplication.id);
    expect(updatedSamlApplication).toEqual(upToDateSamlApplication);
    await deleteSamlApplication(createdSamlApplication.id);
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
