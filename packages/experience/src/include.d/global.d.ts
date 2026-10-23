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

type CapWidgetAttributes = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  // React 18 passes `class` (not `className`) through to custom elements
  class?: string;
  'data-cap-api-endpoint': string;
  'data-cap-lang'?: string;
};

declare global {
  const logtoNativeSdk: LogtoNativeSdkInfo | undefined;
  const logtoSsr: LogtoSsr;

  type GeetestValidate = {
    lot_number: string;
    captcha_output: string;
    pass_token: string;
    gen_time: string;
  };

  type GeetestCaptcha = {
    onReady: (callback: () => void) => GeetestCaptcha;
    onSuccess: (callback: () => void) => GeetestCaptcha;
    onError: (callback: (error: unknown) => void) => GeetestCaptcha;
    onClose: (callback: () => void) => GeetestCaptcha;
    showCaptcha: () => void;
    getValidate: () => GeetestValidate | false;
    reset: () => void;
    destroy: () => void;
  };

  namespace JSX {
    interface IntrinsicElements {
      'cap-widget': CapWidgetAttributes;
    }
  }

  interface Window {
    logtoNativeSdk: LogtoNativeSdkInfo | undefined;
    logtoSsr: LogtoSsr;

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
    initGeetest4?: (
      config: {
        captchaId: string;
        product: 'bind';
        language?: string;
        protocol?: 'https://';
        onError?: (error: unknown) => void;
      },
      callback: (captcha: GeetestCaptcha) => void
    ) => void;
  }
}
