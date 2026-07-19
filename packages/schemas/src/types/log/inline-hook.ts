export type Prefix = 'InlineHook';

export const prefix: Prefix = 'InlineHook';

export enum Type {
  PostFirstFactorVerification = 'PostFirstFactorVerification',
  PostSignIn = 'PostSignIn',
}

export type LogKey = `${Prefix}.${Type}`;
