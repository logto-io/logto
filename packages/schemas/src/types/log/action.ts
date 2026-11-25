export type Prefix = 'Action';

export const prefix: Prefix = 'Action';

export enum Type {
  PostFirstFactorVerification = 'PostFirstFactorVerification',
  PostSignIn = 'PostSignIn',
  PreRegister = 'PreRegister',
}

export type LogKey = `${Prefix}.${Type}`;
