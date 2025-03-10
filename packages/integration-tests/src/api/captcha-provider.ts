import { type CaptchaProvider } from '@logto/schemas';
import { type KyInstance } from 'ky';

import { authedAdminApi } from './api.js';

export const getCaptchaProvider = async (api: KyInstance = authedAdminApi) =>
  api.get('captcha-provider').json<CaptchaProvider>();

export const updateCaptchaProvider = async (
  captchaProvider: Partial<CaptchaProvider>,
  api: KyInstance = authedAdminApi
) =>
  api
    .put('captcha-provider', {
      json: captchaProvider,
    })
    .json<CaptchaProvider>();

export const deleteCaptchaProvider = async (api: KyInstance = authedAdminApi) =>
  api.delete('captcha-provider').json<CaptchaProvider>();
