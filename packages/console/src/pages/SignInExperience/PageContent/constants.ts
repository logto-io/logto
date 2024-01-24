import type { AdminConsoleKey } from '@logto/phrases';
import { SignInIdentifier } from '@logto/schemas';

import { SignUpIdentifier } from '../types';

export const signUpIdentifiers = Object.values(SignUpIdentifier);

export const signInIdentifiers = Object.values(SignInIdentifier);

export const signUpIdentifiersMapping: { [key in SignUpIdentifier]: SignInIdentifier[] } = {
  [SignUpIdentifier.Username]: [SignInIdentifier.Username],
  [SignUpIdentifier.Email]: [SignInIdentifier.Email],
  [SignUpIdentifier.Phone]: [SignInIdentifier.Phone],
  [SignUpIdentifier.EmailOrSms]: [SignInIdentifier.Email, SignInIdentifier.Phone],
  [SignUpIdentifier.None]: [],
};

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

export const signUpIdentifierPhrase = Object.freeze({
  [SignUpIdentifier.Email]: 'sign_in_exp.sign_up_and_sign_in.identifiers_email',
  [SignUpIdentifier.Phone]: 'sign_in_exp.sign_up_and_sign_in.identifiers_phone',
  [SignUpIdentifier.Username]: 'sign_in_exp.sign_up_and_sign_in.identifiers_username',
  [SignUpIdentifier.EmailOrSms]: 'sign_in_exp.sign_up_and_sign_in.identifiers_email_or_sms',
  [SignUpIdentifier.None]: 'sign_in_exp.sign_up_and_sign_in.identifiers_none',
}) satisfies SignUpIdentifierPhrase;
