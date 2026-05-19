import { InteractionEvent } from '@logto/schemas';

import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
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

const buildTextFormData = () => {
  const formData = new FormData();
  formData.append('file', new Blob(['hello'], { type: 'image/png' }), 'avatar.png');
  return formData;
};

const avatarUploadRateLimitMaxAttempts = 10;

devFeatureTest.describe('POST /experience/user-assets/avatar', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it('should reject when interaction event is ForgotPassword', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });

    await expectRejects(client.uploadAvatar(buildPngFormData()), {
      status: 400,
      code: 'session.not_supported_for_forgot_password',
    });
  });

  it('should reject files whose content is not a supported image under Register', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await expectRejects(client.uploadAvatar(buildTextFormData()), {
      status: 400,
      code: 'guard.mime_type_not_allowed',
    });
  });

  it('should pass guards and reach the storage layer under Register', async () => {
    // CI typically does not configure a storage provider, so the storage.not_configured
    // assertion is the deepest reachable layer here. This test confirms that all earlier
    // guards (interaction event, mime type, file presence, file size, tenant id) have
    // passed before the storage check.
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await expectRejects(client.uploadAvatar(buildPngFormData()), {
      code: 'storage.not_configured',
      status: 400,
    });
  });

  it('should reject when interaction event is SignIn', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    await expectRejects(client.uploadAvatar(buildPngFormData()), {
      status: 400,
      code: 'session.invalid_interaction_type',
    });
  });

  it('should rate limit per register interaction and client IP', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await Promise.all(
      Array.from({ length: avatarUploadRateLimitMaxAttempts }, async () =>
        expectRejects(client.uploadAvatar(buildPngFormData()), {
          code: 'storage.not_configured',
          status: 400,
        })
      )
    );

    await expectRejects(client.uploadAvatar(buildPngFormData()), {
      code: 'session.verification_blocked_too_many_attempts',
      status: 429,
    });
  });
});
