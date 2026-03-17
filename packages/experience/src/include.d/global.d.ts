import { type SsrData } from '@logto/schemas';

type LogtoNativeSdkInfo = {
  platform: 'ios' | 'android';
  callbackLink: string;
  getPostMessage: () => (data: { callbackUri?: string; redirectTo?: string }) => void;
  supportedConnector: {
    universal: boolean;
    nativeTargets: string[];
  };
};

type LogtoSsr = string | Readonly<SsrData> | undefined;

declare global {
  const logtoNativeSdk: LogtoNativeSdkInfo | undefined;
  const logtoSsr: LogtoSsr;

  interface Window {
    logtoNativeSdk: LogtoNativeSdkInfo | undefined;
    logtoSsr: LogtoSsr;

    /** Runtime configuration injected by the Logto server. */
    __logtoConfig__?: {
      /** Default phone country code (ISO 3166-1 alpha-2), e.g. "AU" for Australia. */
      defaultPhoneCountryCode?: string;
    };

    // Captcha providers
    grecaptcha?: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (sitekey: string, options: { action: string }) => Promise<string>;
        render: (
          element: HTMLElement,
          options: {
            sitekey: string;
            callback: (token: string) => void;
            theme?: 'light' | 'dark';
            'error-callback'?: (errorCode?: string) => void;
          }
        ) => number;
      };
    };
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          theme: 'light' | 'dark';
          'error-callback': (errorCode: string) => void;
          size: string;
        }
      ) => void;
    };
  }
}
