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

export class LogtoContext {
  private readonly contextData: ContextStore;

  constructor(public readonly account: Account) {
    this.contextData = createContextStore();
  }

  public async init() {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    this.setData('codeVerifier', codeVerifier);
    this.setData('codeChallenge', codeChallenge);
    this.setData('state', generateState());
  }

  public get codeVerifier(): string {
    return this.contextData.getData('codeVerifier');
  }

  public get codeChallenge(): string {
    return this.contextData.getData('codeChallenge');
  }

  public get state(): string {
    return this.contextData.getData('state');
  }

  public get authorizationCode(): string {
    return this.contextData.getData('authorizationCode');
  }

  public get interactionCookie(): string {
    return this.contextData.getData('interactionCookie');
  }

  public get authorizationEndpoint(): string {
    return this.contextData.getData('authorizationEndpoint');
  }

  public get tokenEndpoint(): string {
    return this.contextData.getData('tokenEndpoint');
  }

  public get nextRedirectTo(): string {
    return this.contextData.getData('nextRedirectTo');
  }

  public setData(key: ContextDataKey, value: string): void {
    this.contextData.setData(key, value);
  }
}
