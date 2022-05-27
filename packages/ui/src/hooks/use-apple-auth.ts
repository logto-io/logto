import camelcaseKeys from 'camelcase-keys';
import { useNavigate } from 'react-router-dom';

import { inOperator, parseQueryParameters } from '@/utils';

export const loadAppleSdk = async () =>
  new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    script.src =
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

    document.head.append(script);
  });

export const isAppleConnector = ({ target }: { target: string }) => target === 'apple';

// Derived from https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple

type AppleIdAuth = {
  auth: {
    init(
      config: {
        clientId?: string;
        scope?: string;
        redirectURI?: string;
        state?: string;
        nonce?: string;
        usePopup: boolean;
      } & Record<string, unknown>
    ): void;
    signIn(): Promise<Record<string, unknown>>;
  };
};

declare const AppleID: AppleIdAuth | undefined;

export const getAppleSdk = () => {
  if (AppleID === undefined) {
    throw new Error('AppleID auth SDK not found.');
  }

  return AppleID;
};

const useAppleAuth = () => {
  const navigate = useNavigate();

  const auth = async (connectorId: string, redirectUri: string) => {
    const url = new URL(redirectUri);
    const { redirect_uri: redirectURI, ...rest } = parseQueryParameters(url.searchParams);

    const config = {
      redirectURI: redirectURI ?? '',
      ...camelcaseKeys(rest),
    };
    const { auth } = getAppleSdk();

    auth.init({ usePopup: true, ...config });

    try {
      // https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple#3331292
      const data = await auth.signIn();
      const { authorization } = data;

      if (!authorization || typeof authorization !== 'object') {
        throw new TypeError('Missing authorization object.');
      }

      const state = inOperator('state', authorization) ? String(authorization.state) : '';
      const parameters = new URLSearchParams({
        state,
        // Due to the design limit of connectors, we have to use key `code`.
        // TO-DO: @Darcy @Simeng update key after refactoring
        code: JSON.stringify(data),
      });

      navigate(`/sign-in/callback/${connectorId}?${parameters.toString()}`);
    } catch (error: unknown) {
      // TO-DO: @Simeng handle error properly
      // https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple#3523993
      console.log('error!', error);
    }
  };

  return auth;
};

export default useAppleAuth;
