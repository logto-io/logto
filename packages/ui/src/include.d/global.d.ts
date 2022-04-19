// Logto Native SDK

type LogtoNativeSdkInfo = {
  platform: 'ios' | 'android';
  callbackUriScheme: string;
  getPostMessage: () => (data: { callbackUri?: string; redirectTo?: string }) => void;
  supportedSocialConnectors: string[];
};

declare const logtoNativeSdk: LogtoNativeSdkInfo | undefined;
