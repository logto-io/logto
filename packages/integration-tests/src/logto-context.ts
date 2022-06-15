import { generateCodeVerifier, generateState, generateCodeChallenge } from '@logto/js';

type ContextData = {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
  authorizationCode: string;
  interactionCookie: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  nextRedirectTo: string;
};

type ContextDataKey = keyof ContextData;

type ContextStore = {
  setData: (key: ContextDataKey, value: string) => void;
  getData: (key: ContextDataKey) => string;
};

const createContextStore = (): ContextStore => {
  const data: ContextData = {
    codeVerifier: '',
    codeChallenge: '',
    state: '',
    interactionCookie: '',
    authorizationCode: '',
    authorizationEndpoint: '',
    tokenEndpoint: '',
    nextRedirectTo: '',
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
  getCodeChallenge: () => string;
  getState: () => string;
  getAuthorizationCode: () => string;
  getInteractionCookie: () => string;
  getNextRedirectTo: () => string;
  getAuthorizationEndpoint: () => string;
  getTokenEndpoint: () => string;
  initInteraction: () => Promise<void>;
  updateCookie: (cookie: string) => void;
  setNextRedirectTo: (redirectTo: string) => void;
  setAuthorizationCode: (authorizationCode: string) => void;
  setUpEndpoints: (endpoints: { authorizationEndpoint: string; tokenEndpoint: string }) => void;
};

export const createLogtoContext = (account: Account): LogtoContext => {
  const { getData, setData } = createContextStore();

  const startInteraction = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    setData('codeVerifier', codeVerifier);
    setData('codeChallenge', codeChallenge);
    setData('state', state);
  };

  const updateCookie = (cookie: string) => {
    setData('interactionCookie', cookie);
  };

  const setUpEndpoints = ({
    authorizationEndpoint,
    tokenEndpoint,
  }: {
    authorizationEndpoint: string;
    tokenEndpoint: string;
  }) => {
    setData('authorizationEndpoint', authorizationEndpoint);
    setData('tokenEndpoint', tokenEndpoint);
  };

  const setNextRedirectTo = (redirectTo: string) => {
    setData('nextRedirectTo', redirectTo);
  };

  const setAuthorizationCode = (authorizationCode: string) => {
    setData('authorizationCode', authorizationCode);
  };

  return {
    account,
    getCodeVerifier: () => getData('codeVerifier'),
    getCodeChallenge: () => getData('codeChallenge'),
    getState: () => getData('state'),
    getAuthorizationCode: () => getData('authorizationCode'),
    getInteractionCookie: () => getData('interactionCookie'),
    getNextRedirectTo: () => getData('nextRedirectTo'),
    getAuthorizationEndpoint: () => getData('authorizationEndpoint'),
    getTokenEndpoint: () => getData('tokenEndpoint'),
    initInteraction: startInteraction,
    updateCookie,
    setNextRedirectTo,
    setAuthorizationCode,
    setUpEndpoints,
  };
};
