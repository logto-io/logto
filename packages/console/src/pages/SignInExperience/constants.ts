import type { AdminConsoleKey } from '@logto/phrases';
import { ConnectorType, SignInIdentifier } from '@logto/schemas';

import { SignUpIdentifier } from './types';

export const signUpIdentifiers = Object.values(SignUpIdentifier);

export const signInIdentifiers = Object.values(SignInIdentifier);

export const signUpIdentifiersMapping: { [key in SignUpIdentifier]: SignInIdentifier[] } = {
  [SignUpIdentifier.Username]: [SignInIdentifier.Username],
  [SignUpIdentifier.Email]: [SignInIdentifier.Email],
  [SignUpIdentifier.Phone]: [SignInIdentifier.Phone],
  [SignUpIdentifier.EmailOrSms]: [SignInIdentifier.Email, SignInIdentifier.Phone],
  [SignUpIdentifier.None]: [],
};

export const identifierRequiredConnectorMapping: {
  [key in SignInIdentifier]?: ConnectorType;
} = {
  [SignInIdentifier.Email]: ConnectorType.Email,
  [SignInIdentifier.Phone]: ConnectorType.Sms,
};

type SignInIdentifierPhrase = {
  [key in SignInIdentifier]: AdminConsoleKey;
};

export const signInIdentifierPhrase: SignInIdentifierPhrase = Object.freeze({
  [SignInIdentifier.Email]: 'sign_in_exp.sign_up_and_sign_in.identifiers_email',
  [SignInIdentifier.Phone]: 'sign_in_exp.sign_up_and_sign_in.identifiers_phone',
  [SignInIdentifier.Username]: 'sign_in_exp.sign_up_and_sign_in.identifiers_username',
} as const);

type SignUpIdentifierPhrase = {
  [key in SignUpIdentifier]: AdminConsoleKey;
};

export const signUpIdentifierPhrase: SignUpIdentifierPhrase = Object.freeze({
  [SignUpIdentifier.Email]: 'sign_in_exp.sign_up_and_sign_in.identifiers_email',
  [SignUpIdentifier.Phone]: 'sign_in_exp.sign_up_and_sign_in.identifiers_phone',
  [SignUpIdentifier.Username]: 'sign_in_exp.sign_up_and_sign_in.identifiers_username',
  [SignUpIdentifier.EmailOrSms]: 'sign_in_exp.sign_up_and_sign_in.identifiers_email_or_sms',
  [SignUpIdentifier.None]: 'sign_in_exp.sign_up_and_sign_in.identifiers_none',
} as const);

type NoConnectorWarningPhrase = {
  [key in ConnectorType]: AdminConsoleKey;
};

export const noConnectorWarningPhrase: NoConnectorWarningPhrase = Object.freeze({
  [ConnectorType.Email]: 'sign_in_exp.setup_warning.no_connector_email',
  [ConnectorType.Sms]: 'sign_in_exp.setup_warning.no_connector_sms',
  [ConnectorType.Social]: 'sign_in_exp.setup_warning.no_connector_social',
} as const);
