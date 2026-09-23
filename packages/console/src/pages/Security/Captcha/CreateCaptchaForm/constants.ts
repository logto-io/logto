import { CaptchaType } from '@logto/schemas';

import cap from '@/assets/images/cap.svg?react';
import recaptchaEnterprise from '@/assets/images/recaptcha.svg?react';
import turnstile from '@/assets/images/turnstile.svg?react';

import { type CaptchaProviderMetadata } from './types';

const enableCaptchaReadme = `
## Enable CAPTCHA

Remember to enable CAPTCHA bot protection after you have set up the CAPTCHA provider.

Go to the Security page, find the CAPTCHA tab, and switch on the toggle button of "Enable CAPTCHA".
`;

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
   - **Widget Mode**: You can leave as default, or choose the one suits you best

## Get the site key and secret key

1. Navigate to a widget you just created, and click **Manage widget**.
2. Scroll down to the bottom and copy the **Site key** and **Secret key**.

${enableCaptchaReadme}
`;

const reCAPTCHAEnterpriseReadme = `
# reCAPTCHA Enterprise

reCAPTCHA Enterprise is a Google service that protects websites from fraud and abuse using advanced bot detection without disrupting user experience. This guide will walk you through the process of setting up reCAPTCHA Enterprise with Logto.

## Prerequisites

- A Google Cloud project

## Setup a reCAPTCHA key

1. Go to the [reCAPTCHA page of Google Cloud Console](https://console.cloud.google.com/security/recaptcha).
2. Click **Create key** button near "reCAPTCHA keys".
3. Fill out the form with the following details:
   - **Display name**: Any name you want to give to the key
   - **Application type**: Website
   - **Domain list**: Add Logto's endpoint domain
4. After creating the key, you will be redirected to the key details page, copy the **ID**.

## Setup an API key

1. Go to the [Credentials page of Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Click **Create credentials** button and select **API key**.
3. Copy the API key.
4. Optionally, you can restrict the API key to **reCAPTCHA Enterprise API** to make it more secure.
5. Remember to leave "Application restrictions" to **None** if you don't understand what it is.

## Get project ID

1. Copy the **Project ID** from the [home page of Google Cloud Console](https://console.cloud.google.com/welcome).

${enableCaptchaReadme}
`;

const capReadme = `
# Cap

[Cap](https://capjs.js.org) is an open-source, self-hosted CAPTCHA alternative based on proof-of-work. It has no visual puzzles and doesn't depend on any third-party service, so it works in regions where other CAPTCHA services are unreachable.

## Prerequisites

- A [Cap Standalone](https://capjs.js.org/guide/standalone/) instance that is publicly reachable over HTTPS, since both the sign-in page and Logto need to access it.

## Create a site key

1. Open the dashboard of your Cap Standalone instance and log in with your admin key.
2. Create a new site key. If you restrict CORS origins, add Logto's endpoint domain, e.g. https://[tenant-id].logto.app
3. Copy the **Site key** and **Secret key**. The secret key is only shown once.

## Configure Logto

- **Endpoint**: The URL of your Cap Standalone instance, e.g. https://cap.example.com
- **Site key** and **Secret key**: The values you copied above.

## Security note

Cap's instrumentation challenge evaluates scripts in the browser to detect bots. To support it, the sign-in page allows dynamic JavaScript evaluation (\`'unsafe-eval'\` in the Content Security Policy) while Cap is the CAPTCHA provider.

${enableCaptchaReadme}
`;

export const captchaProviders: CaptchaProviderMetadata[] = [
  {
    name: 'security.captcha_providers.recaptcha_enterprise.name',
    type: CaptchaType.RecaptchaEnterprise,
    logo: recaptchaEnterprise,
    logoDark: recaptchaEnterprise,
    description: 'security.captcha_providers.recaptcha_enterprise.description',
    readme: reCAPTCHAEnterpriseReadme,
    requiredFields: [
      {
        field: 'mode',
        label: 'security.captcha_details.mode',
        placeholder: 'security.captcha_details.mode',
      },
      {
        field: 'siteKey',
        label: 'security.captcha_details.recaptcha_key_id',
        placeholder: 'security.captcha_details.recaptcha_key_id',
      },
      {
        field: 'secretKey',
        label: 'security.captcha_details.recaptcha_api_key',
        placeholder: 'security.captcha_details.recaptcha_api_key',
      },
      {
        field: 'projectId',
        label: 'security.captcha_details.project_id',
        placeholder: 'security.captcha_details.project_id',
      },
      {
        field: 'domain',
        label: 'security.captcha_details.domain',
        placeholder: 'security.captcha_details.domain_placeholder',
        isOptional: true,
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
        placeholder: 'security.captcha_details.site_key',
      },
      {
        field: 'secretKey',
        label: 'security.captcha_details.secret_key',
        placeholder: 'security.captcha_details.secret_key',
      },
    ],
  },
  {
    name: 'security.captcha_providers.cap.name',
    type: CaptchaType.Cap,
    logo: cap,
    logoDark: cap,
    description: 'security.captcha_providers.cap.description',
    readme: capReadme,
    requiredFields: [
      {
        field: 'endpoint',
        label: 'security.captcha_details.cap_endpoint',
        placeholder: 'security.captcha_details.cap_endpoint_placeholder',
      },
      {
        field: 'siteKey',
        label: 'security.captcha_details.site_key',
        placeholder: 'security.captcha_details.site_key',
      },
      {
        field: 'secretKey',
        label: 'security.captcha_details.secret_key',
        placeholder: 'security.captcha_details.secret_key',
      },
    ],
  },
];
