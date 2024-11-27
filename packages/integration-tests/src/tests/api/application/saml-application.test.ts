import { ApplicationType, BindingType } from '@logto/schemas';

import { createApplication, deleteApplication } from '#src/api/application.js';
import { createSamlApplication, deleteSamlApplication } from '#src/api/saml-application.js';
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
        config: {
          acsUrl: {
            binding: BindingType.REDIRECT,
            url: 'https://example.com',
          },
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
        binding: BindingType.POST,
        url: 'https://example.logto.io/sso/saml',
      },
    };
    const createdSamlApplication = await createSamlApplication({
      name: 'test',
      description: 'test',
      config,
    });
    expect(createdSamlApplication.entityId).toEqual(config.entityId);
    expect(createdSamlApplication.acsUrl).toEqual(config.acsUrl);
    await deleteSamlApplication(createdSamlApplication.id);
  });

  it('can not delete non-SAML applications with `DEL /saml-applications/:id` API', async () => {
    const application = await createApplication('test-non-saml-app', ApplicationType.Traditional, {
      isThirdParty: true,
    });

    await expectRejects(deleteSamlApplication(application.id), {
      code: 'application.saml.saml_application_only',
      status: 400,
    });
    await deleteApplication(application.id);
  });
});
