import axios from 'axios';

export const register = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };
  return axios.post<Response>('/api/user', {
    username,
    password,
  });
};
