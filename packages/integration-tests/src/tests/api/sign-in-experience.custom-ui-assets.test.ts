import { ossDefaultQuota } from '@logto/schemas';
import AdmZip from 'adm-zip';

import { baseApi, authedAdminApi } from '#src/api/api.js';
import { updateSignInExperience } from '#src/api/index.js';
import { putSystemLicense } from '#src/api/system.js';
import { isDevFeaturesEnabled, isExperienceBlobsStorageConfigured } from '#src/constants.js';
import { expectRejects } from '#src/helpers/index.js';
import { buildTestLicensePayload, signTestLicenseKey } from '#src/helpers/license.js';

const indexHtml = '<!doctype html><html><body>Custom UI</body></html>';
const script = 'console.log("custom ui");';

const buildAssetsFormData = () => {
  const zip = new AdmZip();
  // Zipped as a folder, the way a build output usually is: its content is served from the root.
  zip.addFile('dist/index.html', Buffer.from(indexHtml));
  zip.addFile('dist/assets/index.js', Buffer.from(script));

  const formData = new FormData();
  formData.append(
    'file',
    new Blob([zip.toBuffer()], { type: 'application/zip' }),
    'custom-ui-assets.zip'
  );

  return formData;
};

const uploadCustomUiAssets = async () =>
  authedAdminApi
    .post('sign-in-exp/default/custom-ui-assets', { body: buildAssetsFormData() })
    .json<{ customUiAssetId: string }>();

const installLicense = async (bringYourUi: boolean) =>
  putSystemLicense(
    await signTestLicenseKey(
      buildTestLicensePayload({ quota: { ...ossDefaultQuota, bringYourUi } })
    )
  );

/**
 * Self-hosted Bring your UI: the assets are unzipped by Core into the S3-compatible storage the
 * deployment configures as its experience blobs provider, and served from there. Provider configs
 * are only read on startup, so this needs an instance started with that storage, which the Docker
 * Compose integration setup provides with an S3 mock.
 */
const describeWithStorage =
  isDevFeaturesEnabled && isExperienceBlobsStorageConfigured ? describe : describe.skip;

describeWithStorage('self-hosted Bring your UI', () => {
  afterAll(async () => {
    await updateSignInExperience({ customUiAssets: null });
    await installLicense(false);
  });

  it('should reject the upload when the license does not grant Bring your UI', async () => {
    await installLicense(false);

    await expectRejects(uploadCustomUiAssets(), {
      code: 'subscription.limit_exceeded',
      status: 403,
    });
  });

  it('should upload the assets to the storage and serve them', async () => {
    await installLicense(true);

    const { customUiAssetId } = await uploadCustomUiAssets();
    await updateSignInExperience({
      customUiAssets: { id: customUiAssetId, createdAt: Date.now() },
    });

    const page = await baseApi.get('sign-in');
    expect(page.headers.get('content-type')).toContain('text/html');
    await expect(page.text()).resolves.toBe(indexHtml);

    const asset = await baseApi.get('assets/index.js');
    expect(asset.headers.get('content-type')).toContain('javascript');
    await expect(asset.text()).resolves.toBe(script);

    const range = await baseApi.get('assets/index.js', { headers: { range: 'bytes=0-6' } });
    expect(range.status).toBe(206);
    expect(range.headers.get('content-range')).toBe(`bytes 0-6/${script.length}`);
    await expect(range.text()).resolves.toBe(script.slice(0, 7));

    const missing = await baseApi.get('assets/missing.js', { throwHttpErrors: false });
    expect(missing.status).toBe(404);
  });
});
