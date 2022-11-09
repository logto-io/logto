import api from './api';
import { bindSocialAccount } from './social';

type Response = {
  redirectTo: string;
};

const continueApiPrefix = '/api/session/continue';

// Only bind with social after the sign-in bind password flow
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

export const continueWithUsername = async (username: string) =>
  api.post(`${continueApiPrefix}/username`, { json: { username } }).json<Response>();

export const continueWithEmail = async (email: string) =>
  api.post(`${continueApiPrefix}/email`, { json: { email } }).json<Response>();

export const continueWithPhone = async (phone: string) =>
  api.post(`${continueApiPrefix}/sms`, { json: { phone } }).json<Response>();
