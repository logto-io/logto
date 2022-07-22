import { generateCodeVerifier, generateState, generateCodeChallenge } from '@logto/js';

import { generatePassword, generateUsername } from '../utils';

type Account = {
  username: string;
  password: string;
};

type ContextData = {
  account: Account;
  codeVerifier: string;
  codeChallenge: string;
  state: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  interactionCookie: string;
  invokeAuthBeforeConsentUri: string;
  signInCallbackUri: string;
};

type ContextDataKey = keyof ContextData;

type ContextStore = {
  getData: <T extends ContextDataKey>(key: T) => ContextData[T];
  setData: <T extends ContextDataKey>(key: T, value: ContextData[T]) => void;
};

const createContextStore = (): ContextStore => {
  const data: ContextData = {
    account: { username: '', password: '' },
    codeVerifier: '',
    codeChallenge: '',
    state: '',
    interactionCookie: '',
    authorizationEndpoint: '',
    tokenEndpoint: '',
    invokeAuthBeforeConsentUri: '',
    signInCallbackUri: '',
  };

  return {
    getData: <T extends ContextDataKey>(key: T) => data[key],
    setData: <T extends ContextDataKey>(key: T, value: ContextData[T]) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      data[key] = value;
    },
  };
};

export class UserSignInContext {
  private readonly contextData: ContextStore = createContextStore();

  public async init() {
    const account = {
      username: generateUsername(),
      password: generatePassword(),
    };
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    this.setData('account', account);
    this.setData('codeVerifier', codeVerifier);
    this.setData('codeChallenge', codeChallenge);
    this.setData('state', generateState());
  }

  public setData<T extends ContextDataKey>(key: T, value: ContextData[T]): void {
    this.contextData.setData(key, value);
  }

  public getData<T extends ContextDataKey>(key: T): ContextData[T] {
    return this.contextData.getData(key);
  }
}
