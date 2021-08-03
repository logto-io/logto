import { FormEventHandler } from 'react';
import create, { SetState, GetState } from 'zustand';

import { signInBasic } from '@/apis/sign-in';

export type PageState = 'idle' | 'loading' | 'error';

export interface Store {
  username: string;
  password: string;
  pageState: PageState;
  setPassword: (password: string) => void;
  setUsername: (username: string) => void;
  signIn: FormEventHandler;
}

const useStore = create<Store>((set: SetState<Store>, get: GetState<Store>) => ({
  username: '',
  password: '',
  pageState: 'idle',
  setPassword: (password) => {
    set({ password });
  },
  setUsername: (username) => {
    set({ username });
  },
  signIn: async (event) => {
    event.preventDefault();
    const { username, password } = get();

    // TODO: empty username & password handler

    set({ pageState: 'loading' });

    try {
      window.location.href = (await signInBasic(username, password)).redirectTo;
    } catch {
      // TODO: api error handler
      set({ pageState: 'error' });
    }
  },
}));

export default useStore;
