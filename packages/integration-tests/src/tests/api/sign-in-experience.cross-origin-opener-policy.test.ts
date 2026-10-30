import { CrossOriginOpenerPolicy, ossDefaultQuota } from '@logto/schemas';

import { baseApi } from '#src/api/api.js';
import { updateSignInExperience } from '#src/api/index.js';
import { putSystemLicense } from '#src/api/system.js';
import { expectRejects } from '#src/helpers/index.js';
import { buildTestLicensePayload, signTestLicenseKey } from '#src/helpers/license.js';
import { devFeatureDisabledTest, devFeatureTest } from '#src/utils.js';

// Security headers are set before Custom UI assets are served, so this id needs no uploaded assets.
const customUiAssets = Object.freeze({
  id: 'integration-test-custom-ui',
  createdAt: 1_778_318_116,
});

const installLicense = async (bringYourUi: boolean) =>
  putSystemLicense(
    await signTestLicenseKey(
      buildTestLicensePayload({ quota: { ...ossDefaultQuota, bringYourUi } })
    )
  );

const getCrossOriginOpenerPolicy = async () => {
  const response = await baseApi.get('sign-in', { throwHttpErrors: false });

  return response.headers.get('cross-origin-opener-policy');
};

describe('sign-in experience Cross-Origin-Opener-Policy', () => {
  afterAll(async () => {
    await updateSignInExperience({
      customUiAssets: null,
      crossOriginOpenerPolicy: CrossOriginOpenerPolicy.UnsafeNone,
    });
    await installLicense(false);
  });

  it('sends no header by default', async () => {
    await updateSignInExperience({
      customUiAssets,
      crossOriginOpenerPolicy: CrossOriginOpenerPolicy.UnsafeNone,
    });

    await expect(getCrossOriginOpenerPolicy()).resolves.toBeNull();
  });

  devFeatureTest.it('sends the header only while Custom UI assets are served', async () => {
    await installLicense(true);
    await updateSignInExperience({
      customUiAssets,
      crossOriginOpenerPolicy: CrossOriginOpenerPolicy.SameOriginAllowPopups,
    });

    await expect(getCrossOriginOpenerPolicy()).resolves.toBe(
      CrossOriginOpenerPolicy.SameOriginAllowPopups
    );

    await updateSignInExperience({ customUiAssets: null });

    await expect(getCrossOriginOpenerPolicy()).resolves.toBeNull();
  });

  devFeatureTest.it('rejects a non-default value without Bring your UI', async () => {
    await installLicense(false);

    await expectRejects(
      updateSignInExperience({ crossOriginOpenerPolicy: CrossOriginOpenerPolicy.SameOrigin }),
      { code: 'request.invalid_input', status: 400 }
    );
  });

  devFeatureDisabledTest.it('rejects a non-default value', async () => {
    await installLicense(true);

    await expectRejects(
      updateSignInExperience({ crossOriginOpenerPolicy: CrossOriginOpenerPolicy.SameOrigin }),
      { code: 'request.invalid_input', status: 400 }
    );
  });
});
