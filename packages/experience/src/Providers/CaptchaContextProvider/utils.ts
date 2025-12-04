import { CaptchaType, RecaptchaEnterpriseMode } from '@logto/schemas';

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

  // For checkbox mode, use explicit render to manually render the widget
  if (config.mode === RecaptchaEnterpriseMode.Checkbox) {
    return `https://${domain}/recaptcha/enterprise.js?render=explicit`;
  }

  // For invisible mode (default), render with siteKey for automatic execution
  return `https://${domain}/recaptcha/enterprise.js?render=${config.siteKey}`;
};
