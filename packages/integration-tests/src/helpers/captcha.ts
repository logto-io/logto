import { CaptchaType } from '@logto/schemas';

import { updateCaptchaProvider } from '#src/api/captcha-provider.js';

// @see https://developers.cloudflare.com/turnstile/troubleshooting/testing/
export const setAlwaysPassCaptcha = async () =>
  updateCaptchaProvider({
    config: {
      type: CaptchaType.Turnstile,
      siteKey: '1x00000000000000000000AA',
      secretKey: '1x0000000000000000000000000000000AA',
    },
  });

export const setAlwaysFailCaptcha = async () =>
  updateCaptchaProvider({
    config: {
      type: CaptchaType.Turnstile,
      siteKey: '1x00000000000000000000AA',
      secretKey: '6LeIxAcTAAAAAGG-2x0000000000000000000000000000000AA',
    },
  });
