export type CamelCase<T> = T extends `${infer A}_${infer B}`
  ? `${A}${Capitalize<CamelCase<B>>}`
  : T;

export type StorageType =
  | 'appearance_mode'
  | 'linking_social_connector'
  | 'checkout_session'
  | 'redirect_after_sign_in'
  | 'webhook_test_result';

export const getStorageKey = <T extends StorageType>(forType: T) =>
  `logto:admin_console:${forType}` as const;

export const storageKeys = Object.freeze({
  appearanceMode: getStorageKey('appearance_mode'),
  linkingSocialConnector: getStorageKey('linking_social_connector'),
  checkoutSession: getStorageKey('checkout_session'),
  /** The react-router redirect location after sign in. The value should be a stringified Location object. */
  redirectAfterSignIn: getStorageKey('redirect_after_sign_in'),
  webhookTestResult: getStorageKey('webhook_test_result'),
} satisfies Record<CamelCase<StorageType>, string>);
