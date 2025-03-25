import { AlternativeSignUpIdentifier, SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { isDevFeaturesEnabled } from '@/consts/env';
import { DragDropProvider, DraggableItem } from '@/ds-components/DragDrop';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';

import type { SignInExperienceForm } from '../../../../types';
import { signInIdentifiers, signUpIdentifiersMapping } from '../../../constants';
import { identifierRequiredConnectorMapping } from '../../constants';
import {
  getSignUpRequiredConnectorTypes,
  createSignInMethod,
  getSignUpIdentifiersRequiredConnectors,
} from '../../utils';

import AddButton from './AddButton';
import SignInMethodItem from './SignInMethodItem';
import styles from './index.module.scss';

function SignInMethodEditBox() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    watch,
    trigger,
    formState: { submitCount },
  } = useFormContext<SignInExperienceForm>();
  const signUp = watch('signUp');

  const { fields, swap, update, remove, append } = useFieldArray({
    control,
    name: 'signIn.methods',
  });

  const revalidate = () => {
    if (submitCount) {
      // Note: wait for the form to be updated before validating the new data.
      setTimeout(() => {
        void trigger('signIn.methods');
      }, 0);
    }
  };

  const { isConnectorTypeEnabled } = useEnabledConnectorTypes();

  const {
    identifier: signUpIdentifier,
    identifiers,
    password: isSignUpPasswordRequired,
    verify: isSignUpVerificationRequired,
  } = signUp;

  const requiredSignInIdentifiers = signUpIdentifiersMapping[signUpIdentifier];
  const signUpIdentifiers = identifiers.map(({ identifier }) => identifier);

  // TODO: Remove this dev feature guard when multi sign-up identifiers are launched
  const ignoredWarningConnectors = isDevFeaturesEnabled
    ? getSignUpIdentifiersRequiredConnectors(signUpIdentifiers)
    : getSignUpRequiredConnectorTypes(signUpIdentifier);

  const signInIdentifierOptions = signInIdentifiers.filter((candidateIdentifier) =>
    fields.every(({ identifier }) => identifier !== candidateIdentifier)
  );

  const isVerificationCodeCheckable = useCallback(
    (identifier: SignInIdentifier) => {
      if (identifier === SignInIdentifier.Username) {
        return false;
      }

      if (isSignUpPasswordRequired) {
        return true;
      }

      if (!isDevFeaturesEnabled) {
        return !isSignUpVerificationRequired;
      }

      // If the sign-in identifier is also enabled for sign-up.
      const signUpVerificationRequired = signUpIdentifiers.some(
        (signUpIdentifier) =>
          signUpIdentifier === identifier ||
          signUpIdentifier === AlternativeSignUpIdentifier.EmailOrPhone
      );

      return !signUpVerificationRequired;
    },
    [isSignUpPasswordRequired, isSignUpVerificationRequired, signUpIdentifiers]
  );

  return (
    <div>
      <DragDropProvider>
        {fields.map((signInMethod, index) => {
          const { id, identifier, verificationCode, isPasswordPrimary } = signInMethod;
          const signInRelatedConnector = identifierRequiredConnectorMapping[identifier];
          const requiredConnectors =
            conditional(
              verificationCode &&
                signInRelatedConnector &&
                !ignoredWarningConnectors.includes(signInRelatedConnector) && [
                  signInRelatedConnector,
                ]
            ) ?? [];

          return (
            <DraggableItem
              key={id}
              id={id}
              sortIndex={index}
              moveItem={swap}
              className={styles.draggleItemContainer}
            >
              <Controller
                control={control}
                name={`signIn.methods.${index}`}
                rules={{
                  validate: ({ password, verificationCode }) => {
                    if (!password && !verificationCode) {
                      return t('sign_in_exp.sign_up_and_sign_in.sign_in.require_auth_factor');
                    }

                    if (
                      verificationCode &&
                      requiredConnectors.some(
                        (connectorType) => !isConnectorTypeEnabled(connectorType)
                      )
                    ) {
                      // Note: when required connectors are not all enabled, we show error state without error message for we have the connector setup warning
                      return false;
                    }

                    return true;
                  },
                }}
                render={({ field: { value }, fieldState: { error } }) => (
                  <SignInMethodItem
                    signInMethod={value}
                    isPasswordCheckable={
                      identifier !== SignInIdentifier.Username &&
                      (isDevFeaturesEnabled || !isSignUpPasswordRequired)
                    }
                    isVerificationCodeCheckable={isVerificationCodeCheckable(value.identifier)}
                    isDeletable={
                      isDevFeaturesEnabled || !requiredSignInIdentifiers.includes(identifier)
                    }
                    requiredConnectors={requiredConnectors}
                    hasError={Boolean(error)}
                    errorMessage={error?.message}
                    onVerificationStateChange={(verification, checked) => {
                      update(index, { ...value, [verification]: checked });
                      revalidate();
                    }}
                    onToggleVerificationPrimary={() => {
                      update(index, { ...value, isPasswordPrimary: !isPasswordPrimary });
                      revalidate();
                    }}
                    onDelete={() => {
                      remove(index);
                      revalidate();
                    }}
                  />
                )}
              />
            </DraggableItem>
          );
        })}
      </DragDropProvider>
      <AddButton
        options={signInIdentifierOptions}
        hasSelectedIdentifiers={fields.length > 0}
        onSelected={(identifier) => {
          append(createSignInMethod(identifier));
          revalidate();
        }}
      />
    </div>
  );
}

export default SignInMethodEditBox;
