import type { TFuncKey } from 'i18next';

export type ResetPasswordMagicLinkError = {
  readonly message?: TFuncKey;
  readonly rawMessage?: string;
};
