import type { SignUp } from '@logto/schemas';
import { SignInIdentifier, ConnectorType, AlternativeSignUpIdentifier } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

const validatePrimarySignUpIdentifier = ({ identifiers, secondaryIdentifiers = [] }: SignUp) => {
  if (secondaryIdentifiers.length > 0) {
    assertThat(identifiers.length > 0, 'sign_in_experiences.missing_sign_up_identifiers');
  }
};

const validateSignUpIdentifiersUniqueness = ({
  identifiers,
  secondaryIdentifiers = [],
}: SignUp) => {
  const primaryIdentifiers = new Set(identifiers);
  const secondaryIdentifiersSet = new Set(secondaryIdentifiers.map((item) => item.identifier));

  assertThat(
    primaryIdentifiers.size === identifiers.length &&
      secondaryIdentifiersSet.size === secondaryIdentifiers.length,
    new RequestError({
      code: 'sign_in_experiences.duplicated_sign_up_identifiers',
    })
  );

  for (const identifier of secondaryIdentifiersSet) {
    if (identifier === AlternativeSignUpIdentifier.EmailOrPhone) {
      assertThat(
        !primaryIdentifiers.has(SignInIdentifier.Email) &&
          !primaryIdentifiers.has(SignInIdentifier.Phone),
        new RequestError({
          code: 'sign_in_experiences.duplicated_sign_up_identifiers',
        })
      );
      continue;
    }

    assertThat(
      !primaryIdentifiers.has(identifier),
      new RequestError({
        code: 'sign_in_experiences.duplicated_sign_up_identifiers',
      })
    );
  }
};

const validatePasswordlessIdentifiers = (
  { identifiers, secondaryIdentifiers = [], verify }: SignUp,
  enabledConnectors: LogtoConnector[]
) => {
  if (
    identifiers.some((identifier) => identifier !== SignInIdentifier.Username) ||
    secondaryIdentifiers.some(({ identifier }) => identifier !== SignInIdentifier.Username)
  ) {
    // Passwordless identifiers must have verify enabled.
    assertThat(
      verify,
      new RequestError({
        code: 'sign_in_experiences.passwordless_requires_verify',
      })
    );
  }

  // Secondary passwordless identifiers must have verify enabled.
  for (const { identifier, verify } of secondaryIdentifiers) {
    assertThat(
      identifier === SignInIdentifier.Username || verify,
      new RequestError({
        code: 'sign_in_experiences.passwordless_requires_verify',
      })
    );
  }

  const primaryIdentifiers = new Set(identifiers);
  const secondaryIdentifiersSet = new Set(secondaryIdentifiers.map((item) => item.identifier));

  // Assert email connector is enabled
  if (
    primaryIdentifiers.has(SignInIdentifier.Email) ||
    secondaryIdentifiersSet.has(SignInIdentifier.Email) ||
    secondaryIdentifiersSet.has(AlternativeSignUpIdentifier.EmailOrPhone)
  ) {
    assertThat(
      enabledConnectors.some((item) => item.type === ConnectorType.Email),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Email,
      })
    );
  }

  // Assert sms connector is enabled
  if (
    primaryIdentifiers.has(SignInIdentifier.Phone) ||
    secondaryIdentifiersSet.has(SignInIdentifier.Phone) ||
    secondaryIdentifiersSet.has(AlternativeSignUpIdentifier.EmailOrPhone)
  ) {
    assertThat(
      enabledConnectors.some((item) => item.type === ConnectorType.Sms),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Sms,
      })
    );
  }
};

export const validateSignUp = (signUp: SignUp, enabledConnectors: LogtoConnector[]) => {
  validatePrimarySignUpIdentifier(signUp);

  validateSignUpIdentifiersUniqueness(signUp);

  validatePasswordlessIdentifiers(signUp, enabledConnectors);
};
