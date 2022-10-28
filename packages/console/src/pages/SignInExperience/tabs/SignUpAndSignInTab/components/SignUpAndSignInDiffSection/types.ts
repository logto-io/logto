import type { SignUp } from '@logto/schemas';

import type { SignInMethod } from '../SignInMethodEditBox/types';

export type Mutation = 'added' | 'removed' | 'none';

export type SignUpDiff = { [K in keyof SignUp]: Array<{ mutation: Mutation; value: SignUp[K] }> };

export type SignInMethodsDiff = Array<{
  mutation: Mutation;
  identifier: SignInMethod['identifier'];
  password: Array<{
    mutation: Mutation;
    value: SignInMethod['password'];
  }>;
  verificationCode: Array<{
    mutation: Mutation;
    value: SignInMethod['verificationCode'];
  }>;
}>;

export type SocialTargetsDiff = Array<{
  mutation: Mutation;
  value: string;
}>;
