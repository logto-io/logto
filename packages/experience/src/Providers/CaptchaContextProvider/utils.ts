import { CaptchaType } from '@logto/schemas';

import { type SignInExperienceResponse } from '@/types';

export const getScript = (config: SignInExperienceResponse['captchaConfig']) => {
  // Not supposed to happen
  if (!config) {
    throw new Error('Captcha config is not found');
  }

  if (config.type === CaptchaType.Turnstile) {
    return `https://challenges.cloudflare.com/turnstile/v0/api.js`;
  }

  const domain = config.domain ?? 'www.google.com';
  return `https://${domain}/recaptcha/enterprise.js?render=${config.siteKey}`;
};
