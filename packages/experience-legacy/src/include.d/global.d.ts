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
  }
}
