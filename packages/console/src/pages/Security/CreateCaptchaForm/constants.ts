import { CaptchaType } from '@logto/schemas';

import recaptchaEnterprise from '@/assets/images/recaptcha.svg?react';
import turnstile from '@/assets/images/turnstile.svg?react';

import { type CaptchaProviderMetadata } from './types';

export const captchaProviders: CaptchaProviderMetadata[] = [
  {
    name: 'security.captcha_providers.recaptcha_enterprise.name',
    type: CaptchaType.RecaptchaEnterprise,
    logo: recaptchaEnterprise,
    logoDark: recaptchaEnterprise,
    description: 'security.captcha_providers.recaptcha_enterprise.description',
    readme: 'readme',
    requiredFields: [
      {
        field: 'siteKey',
        label: 'security.captcha_details.recaptcha_key_id',
      },
      {
        field: 'secretKey',
        label: 'security.captcha_details.recaptcha_api_key',
      },
      {
        field: 'projectId',
        label: 'security.captcha_details.project_id',
      },
    ],
  },
  {
    name: 'security.captcha_providers.turnstile.name',
    type: CaptchaType.Turnstile,
    logo: turnstile,
    logoDark: turnstile,
    description: 'security.captcha_providers.turnstile.description',
    readme: 'readme',
    requiredFields: [
      {
        field: 'siteKey',
        label: 'security.captcha_details.site_key',
      },
      {
        field: 'secretKey',
        label: 'security.captcha_details.secret_key',
      },
    ],
  },
];
