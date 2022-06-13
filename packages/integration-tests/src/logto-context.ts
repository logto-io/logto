import {
  generateCodeVerifier,
  generateState,
  generateCodeChallenge,
  generateSignInUri,
} from '@logto/js';
import got, { Response } from 'got/dist/source';

import { authorizationEndpoint, adminConsoleAppId, redirectUri } from './constants';
import { extractCookie } from './utils';

type ContextData = {
  codeVerifier: string;
  state: string;
  interactionCookie: string;
};

type ContextDataKey = keyof ContextData;

type ContextStore = {
  setData: (key: ContextDataKey, value: string) => void;
  getData: (key: ContextDataKey) => string;
};

const createContextStore = (): ContextStore => {
  const data: ContextData = {
    codeVerifier: '',
    state: '',
    interactionCookie: '',
  };

  return {
    getData: (key: ContextDataKey) => data[key],
    setData: (key: ContextDataKey, value: string) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      data[key] = value;
    },
  };
};

type Account = {
  username: string;
  password: string;
};

export type LogtoContext = {
  account: Account;
  getCodeVerifier: () => string;
  getState: () => string;
  getInteractionCookie: () => string;
  startInteraction: () => Promise<void>;
  resetInteraction: () => void;
  updateCookie: (cookie: string) => void;
};

export const createLogtoContext = (account: Account): LogtoContext => {
  const { getData, setData } = createContextStore();

  const startInteraction = async () => {
    const codeVerifier = generateCodeVerifier();
    setData('codeVerifier', codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const state = generateState();
    setData('state', state);

    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId: adminConsoleAppId,
      redirectUri,
      codeChallenge,
      state,
    });

    const response: Response = await got(signInUri, {
      followRedirect: false,
    });

    setData('interactionCookie', extractCookie(response));
  };

  const resetInteraction = () => {
    setData('codeVerifier', '');
    setData('state', '');
    setData('interactionCookie', '');
  };

  const updateCookie = (cookie: string) => {
    setData('interactionCookie', cookie);
  };

  return {
    account,
    getCodeVerifier: () => getData('codeVerifier'),
    getInteractionCookie: () => getData('interactionCookie'),
    getState: () => getData('state'),
    startInteraction,
    resetInteraction,
    updateCookie,
  };
};
