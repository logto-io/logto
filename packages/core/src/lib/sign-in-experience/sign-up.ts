import type { SignUp } from '@logto/schemas';
import { ConnectorType, SignUpIdentifier } from '@logto/schemas';

import type { LogtoConnector } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

export const validateSignUp = (signUp: SignUp, enabledConnectors: LogtoConnector[]) => {
  if (
    signUp.identifier === SignUpIdentifier.Email ||
    signUp.identifier === SignUpIdentifier.EmailOrSms
  ) {
    assertThat(
      enabledConnectors.some((item) => item.type === ConnectorType.Email),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Email,
      })
    );
  }

  if (
    signUp.identifier === SignUpIdentifier.Sms ||
    signUp.identifier === SignUpIdentifier.EmailOrSms
  ) {
    assertThat(
      enabledConnectors.some((item) => item.type === ConnectorType.Sms),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Sms,
      })
    );
  }

  if (signUp.identifier === SignUpIdentifier.Username) {
    assertThat(
      signUp.password,
      new RequestError({
        code: 'sign_in_experiences.username_requires_password',
      })
    );
  }

  if (
    [SignUpIdentifier.Sms, SignUpIdentifier.Email, SignUpIdentifier.EmailOrSms].includes(
      signUp.identifier
    )
  ) {
    assertThat(
      signUp.verify,
      new RequestError({
        code: 'sign_in_experiences.passwordless_requires_verify',
      })
    );
  }
};
