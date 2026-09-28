import { ApplicationType, ossDefaultQuota } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';

import { getApplications } from '#src/api/application.js';
import {
  createSamlApplication,
  deleteSamlApplication,
  getSamlApplication,
} from '#src/api/saml-application.js';
import { putSystemLicense } from '#src/api/system.js';
import { expectRejects } from '#src/helpers/index.js';
import { buildTestLicensePayload, signTestLicenseKey } from '#src/helpers/license.js';
import { devFeatureTest, generateTestName } from '#src/utils.js';

const installLicense = async (samlApplicationsLimit?: Nullable<number>) => {
  const license = await signTestLicenseKey(
    buildTestLicensePayload({
      quota: samlApplicationsLimit === undefined ? {} : { samlApplicationsLimit },
    })
  );
  const response = await putSystemLicense(license);
  expect(response.status).toEqual(204);
};

// The license is behind the self-hosted plans feature, which the instance under test only enables
// with `DEV_FEATURES_ENABLED`.
devFeatureTest.describe('SAML application cap lifted by a self-hosted license', () => {
  const createdIds: string[] = [];

  afterAll(async () => {
    await Promise.all(createdIds.map(async (id) => deleteSamlApplication(id)));
    // No license can be uninstalled; leave one that grants nothing beyond the OSS defaults.
    await installLicense();
  });

  it('should allow SAML applications beyond the OSS cap with a license that lifts it', async () => {
    await installLicense(null);

    const existing = await getApplications([ApplicationType.SAML]);
    const toCreate = Math.max(ossDefaultQuota.samlApplicationsLimit + 1 - existing.length, 1);

    for (const _ of Array.from({ length: toCreate })) {
      // eslint-disable-next-line no-await-in-loop -- Create one by one so the cap is checked against each new count.
      const { id } = await createSamlApplication({ name: generateTestName() });
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Collect IDs for cleanup.
      createdIds.push(id);
    }

    const samlApplications = await getApplications([ApplicationType.SAML]);
    expect(samlApplications.length).toBeGreaterThan(ossDefaultQuota.samlApplicationsLimit);
  });

  it('should cap creation again but keep existing applications readable once the license no longer lifts it', async () => {
    await installLicense();

    await expectRejects(createSamlApplication({ name: generateTestName() }), {
      code: 'application.saml.reach_oss_limit',
      status: 403,
    });

    await Promise.all(
      createdIds.map(async (id) => expect(getSamlApplication(id)).resolves.toMatchObject({ id }))
    );
  });
});
