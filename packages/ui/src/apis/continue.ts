import api from './api';
import { bindSocialAccount } from './social';

type Response = {
  redirectTo: string;
};

const continueApiPrefix = '/api/session/sign-in/continue';

// Bind with social after all the sign-in continue flow
export const continueWithPassword = async (password: string, socialToBind?: string) => {
  const result = await api
    .post(`${continueApiPrefix}/password`, {
      json: { password },
    })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const continueWithUsername = async (username: string, socialToBind?: string) => {
  const result = await api
    .post(`${continueApiPrefix}/username`, { json: { username } })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const continueWithEmail = async (email: string, socialToBind?: string) => {
  const result = await api.post(`${continueApiPrefix}/email`, { json: { email } }).json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const continueWithPhone = async (phone: string, socialToBind?: string) => {
  const result = await api.post(`${continueApiPrefix}/sms`, { json: { phone } }).json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};
