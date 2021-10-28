import axios from 'axios';

export const signInBasic = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };
  return axios.post<Response>('/api/session', {
    username,
    password,
  });
};
