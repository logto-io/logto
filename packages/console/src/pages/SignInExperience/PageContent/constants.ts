import type { AdminConsoleKey } from '@logto/phrases';
import { SignInIdentifier } from '@logto/schemas';

import { type SignUpIdentifier } from '../types';

export const signInIdentifiers = Object.values(SignInIdentifier);

type SignInIdentifierPhrase = {
  [key in SignInIdentifier]: AdminConsoleKey;
};

export const signInIdentifierPhrase = Object.freeze({
  [SignInIdentifier.Email]: 'sign_in_exp.sign_up_and_sign_in.identifiers_email',
  [SignInIdentifier.Phone]: 'sign_in_exp.sign_up_and_sign_in.identifiers_phone',
  [SignInIdentifier.Username]: 'sign_in_exp.sign_up_and_sign_in.identifiers_username',
}) satisfies SignInIdentifierPhrase;

type SignUpIdentifierPhrase = {
  [key in SignUpIdentifier]: AdminConsoleKey;
};
