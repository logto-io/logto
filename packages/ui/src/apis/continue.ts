import api from './api';
import { bindSocialAccount } from './social';

type Response = {
  redirectTo: string;
};

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
