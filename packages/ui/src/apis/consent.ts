import axios from 'axios';

export const consent = async () => {
  type Response = {
    redirectTo: string;
  };
  return axios.post<Response>('/api/session/consent');
};
