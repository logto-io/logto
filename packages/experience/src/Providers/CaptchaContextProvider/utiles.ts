import { CaptchaType } from '@logto/schemas';

import { type SignInExperienceResponse } from '@/types';

export const getScript = (config: SignInExperienceResponse['captchaConfig']) => {
  if (!config) {
    throw new Error('Captcha config is not found');
  }

  if (config.type === CaptchaType.Turnstile) {
    return `https://challenges.cloudflare.com/turnstile/v0/api.js`;
  }

  return `https://www.google.com/recaptcha/enterprise.js?render=${config.siteKey}`;
};
