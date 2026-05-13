import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue } from '@logto/schemas';

import { updateAccountCenter } from '#src/api/account-center.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest } from '#src/utils.js';

const buildPngFormData = () => {
  const formData = new FormData();
  // 1x1 transparent PNG
  const png = Buffer.from(
    '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63FCFFFFFF1F00040501FE6F1B5F570000000049454E44AE426082',
    'hex'
  );
  formData.append('file', new Blob([png], { type: 'image/png' }), 'avatar.png');
  return formData;
};

devFeatureTest.describe(
  'POST /my-account/user-assets and GET /my-account/user-assets/service-status',
  () => {
    beforeAll(async () => {
      await enableAllPasswordSignInMethods();
      await updateAccountCenter({
        enabled: true,
        fields: {
          avatar: AccountCenterControlValue.Edit,
        },
      });
    });

    it('should be able to query service status', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile],
      });

      const response = await api
        .get('api/my-account/user-assets/service-status')
        .json<{ status: string }>();
      // CI does not configure a storage provider, so the expected status is `not_configured`.
      // Both responses are acceptable shapes.
      expect(['ready', 'not_configured']).toContain(response.status);

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail when avatar field is not editable', async () => {
      await updateAccountCenter({
        enabled: true,
        fields: {
          avatar: AccountCenterControlValue.ReadOnly,
        },
      });

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile],
      });

      await expectRejects(api.post('api/my-account/user-assets', { body: buildPngFormData() }), {
        code: 'account_center.field_not_editable',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);

      // Restore for subsequent tests
      await updateAccountCenter({
        enabled: true,
        fields: {
          avatar: AccountCenterControlValue.Edit,
        },
      });
    });

    it('should fail when storage is not configured (or succeed when configured)', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile],
      });

      const { status } = await api
        .get('api/my-account/user-assets/service-status')
        .json<{ status: 'ready' | 'not_configured' }>();

      if (status === 'not_configured') {
        // CI typically does not configure a storage provider; expect a `storage.not_configured` error.
        await expectRejects(api.post('api/my-account/user-assets', { body: buildPngFormData() }), {
          code: 'storage.not_configured',
          status: 400,
        });
      } else {
        const response = await api
          .post('api/my-account/user-assets', { body: buildPngFormData() })
          .json<{ url: string }>();
        expect(typeof response.url).toBe('string');
        expect(response.url.length).toBeGreaterThan(0);
      }

      await deleteDefaultTenantUser(user.id);
    });
  }
);
