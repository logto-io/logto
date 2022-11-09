import { PasscodeType } from '@logto/schemas';

import api from './api';
import { bindSocialAccount } from './social';

type Response = {
  redirectTo: string;
};

const passwordlessApiPrefix = '/api/session/passwordless';
const continueApiPrefix = '/api/session/sign-in/continue';

type ContinueKey = 'password' | 'username' | 'email' | 'phone';

export const continueApi = async (key: ContinueKey, value: string, socialToBind?: string) => {
  const result = await api
    .post(`${continueApiPrefix}/${key === 'phone' ? 'sms' : key}`, {
      json: { [key]: value },
    })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const sendContinueSetEmailPasscode = async (email: string) => {
  await api
    .post(`${passwordlessApiPrefix}/email/send`, {
      json: {
        email,
        flow: PasscodeType.Continue,
      },
    })
    .json();

  return { success: true };
};

export const sendContinueSetPhonePasscode = async (phone: string) => {
  await api
    .post(`${passwordlessApiPrefix}/sms/send`, {
      json: {
        phone,
        flow: PasscodeType.Continue,
      },
    })
    .json();

  return { success: true };
};

export const sendContinueSetEmailPasscode = async (email: string) => {
  await api
    .post(`${passwordlessApiPrefix}/email/send`, {
      json: {
        email,
        flow: PasscodeType.Continue,
      },
    })
    .json();

  return { success: true };
};

export const sendContinueSetPhonePasscode = async (phone: string) => {
  await api
    .post(`${passwordlessApiPrefix}/sms/send`, {
      json: {
        phone,
        flow: PasscodeType.Continue,
      },
    })
    .json();

  return { success: true };
};

export const verifyContinueSetEmailPasscode = async (email: string, code: string) => {
  await api
    .post(`${passwordlessApiPrefix}/email/verify`, {
      json: { email, code, flow: PasscodeType.Continue },
    })
    .json();

  return { success: true };
};

export const verifyContinueSetSmsPasscode = async (phone: string, code: string) => {
  await api
    .post(`${passwordlessApiPrefix}/sms/verify`, {
      json: { phone, code, flow: PasscodeType.Continue },
    })
    .json();

  return { success: true };
};
