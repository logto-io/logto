import {
  ApplicationType,
  type ApplicationSignInExperienceCreate,
  type Application,
} from '@logto/schemas';

import {
  getApplicationSignInExperience,
  setApplicationSignInExperience,
} from '#src/api/application-sign-in-experience.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { expectRejects } from '#src/helpers/index.js';

describe('application sign in experience', () => {
  const applications = new Map<string, Application>();

  const applicationSignInExperiences: ApplicationSignInExperienceCreate = {
    branding: {
      logoUrl: 'https://logto.dev/logo.png',
      darkLogoUrl: 'https://logto.dev/logo-dark.png',
    },
    color: {
      primaryColor: '#f00',
      darkPrimaryColor: '#0f0',
    },
    customCss: '.logto_main-content { background-color: #f00 !important; }',
    termsOfUseUrl: 'https://logto.dev/terms-of-use',
    privacyPolicyUrl: 'https://logto.dev/privacy-policy',
    displayName: 'Logto Demo',
  };

  beforeAll(async () => {
    const firstPartyApp = await createApplication('first-party-application', ApplicationType.SPA);
    const thirdPartyApp = await createApplication(
      'third-party-application',
      ApplicationType.Traditional,
      {
        isThirdParty: true,
      }
    );

    applications.set('firstPartyApp', firstPartyApp);
    applications.set('thirdPartyApp', thirdPartyApp);
  });

  afterAll(async () => {
    await Promise.all(
      Array.from(applications.values()).map(async (applications) =>
        deleteApplication(applications.id)
      )
    );
  });

  it('should throw 404 if application does not exist', async () => {
    await expectRejects(
      setApplicationSignInExperience('non-existent-application', applicationSignInExperiences),
      {
        code: 'entity.not_exists_with_id',
        status: 404,
      }
    );
  });

  it('should set new application sign in experience', async () => {
    const application = applications.get('thirdPartyApp')!;

    const signInExperience = await setApplicationSignInExperience(
      application.id,
      applicationSignInExperiences
    );

    expect(signInExperience).toMatchObject({
      ...applicationSignInExperiences,
      applicationId: application.id,
      tenantId: application.tenantId,
    });

    const getSignInExperience = await getApplicationSignInExperience(application.id);
    expect(getSignInExperience).toMatchObject(signInExperience);
  });

  it('should update existing application sign in experience', async () => {
    const application = applications.get('thirdPartyApp')!;

    const signInExperience = await setApplicationSignInExperience(application.id, {
      ...applicationSignInExperiences,
      displayName: '',
      customCss: '',
    });

    expect(signInExperience).toMatchObject({
      ...applicationSignInExperiences,
      displayName: null,
      customCss: null,
      applicationId: application.id,
      tenantId: application.tenantId,
    });

    const getSignInExperience = await getApplicationSignInExperience(application.id);

    expect(getSignInExperience).toMatchObject(signInExperience);
  });

  it('should throw 404 if application sign in experience does not exist', async () => {
    const application = applications.get('firstPartyApp')!;

    await expectRejects(getApplicationSignInExperience(application.id), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });
});
