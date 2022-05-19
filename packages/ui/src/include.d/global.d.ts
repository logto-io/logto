// Logto Native SDK

type LogtoNativeSdkInfo = {
  platform: 'ios' | 'android';
  callbackLink: string;
  getPostMessage: () => (data: { callbackUri?: string; redirectTo?: string }) => void;
  supportedSocialConnectorTargets: string[];
};

declare const logtoNativeSdk: LogtoNativeSdkInfo | undefined;
