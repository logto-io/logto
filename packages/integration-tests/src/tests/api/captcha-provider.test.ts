import { CaptchaType } from '@logto/schemas';

import {
  deleteCaptchaProvider,
  getCaptchaProvider,
  updateCaptchaProvider,
} from '#src/api/captcha-provider.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('captcha provider', () => {
  it('should update and get captcha provider successfully', async () => {
    await updateCaptchaProvider({
      config: {
        type: CaptchaType.Turnstile,
        siteKey: 'site_key',
        secretKey: 'secret_key',
      },
    });
    const captchaProvider = await getCaptchaProvider();

    expect(captchaProvider).toMatchObject({
      config: {
        type: CaptchaType.Turnstile,
        siteKey: 'site_key',
        secretKey: 'secret_key',
      },
    });

    await updateCaptchaProvider({
      config: {
        type: CaptchaType.RecaptchaEnterprise,
        siteKey: 'site_key',
        secretKey: 'secret_key',
        projectId: 'project_id',
      },
    });

    const updatedCaptchaProvider = await getCaptchaProvider();

    expect(updatedCaptchaProvider).toMatchObject({
      config: {
        type: CaptchaType.RecaptchaEnterprise,
        siteKey: 'site_key',
        secretKey: 'secret_key',
        projectId: 'project_id',
      },
    });
  });

  it('should delete captcha provider successfully', async () => {
    await updateCaptchaProvider({
      config: {
        type: CaptchaType.Turnstile,
        siteKey: 'site_key',
        secretKey: 'secret_key',
      },
    });
    const captchaProvider = await getCaptchaProvider();

    expect(captchaProvider).toMatchObject({
      config: {
        type: CaptchaType.Turnstile,
        siteKey: 'site_key',
        secretKey: 'secret_key',
      },
    });

    await deleteCaptchaProvider();

    await expectRejects(getCaptchaProvider(), {
      code: 'entity.not_found',
      status: 404,
    });
  });
});
