import { CaptchaType } from '@logto/schemas';

import recaptchaEnterprise from '@/assets/images/recaptcha.svg?react';
import turnstile from '@/assets/images/turnstile.svg?react';

import { type CaptchaProviderMetadata } from './types';

const turnstileReadme = `
# Cloudflare Turnstile

Turnstile is a CAPTCHA service that helps protect your website from spam and abuse. This guide will walk you through the process of setting up Turnstile with Logto.

## Prerequisites

- A Cloudflare account

## Setup

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/login) and select your account.
2. Navigate to **Turnstile** > **Add widget**.
3. Fill out the form with the following details:
   - **Widget name**: Any name you want to give to the widget
   - **Hostname**: Logto's endpoint domain, e.g. https://[tenant-id].logto.app
   - **Widget Mode**: Leave as default

## Get the site key and secret key

1. Navigate to a widget you just created, and click **Manage widget**.
2. Scroll down to the bottom and copy the **Site key** and **Secret key**.
`;

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
    readme: turnstileReadme,
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
