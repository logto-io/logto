import {
  AlternativeSignUpIdentifier,
  SignInIdentifier,
  MfaFactor,
  type SignInExperience,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { DragDropProvider, DraggableItem } from '@/ds-components/DragDrop';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';

import type { SignInExperienceForm } from '../../../../types';
import { signInIdentifiers } from '../../../constants';
import { identifierRequiredConnectorMapping } from '../../constants';
import { createSignInMethod, getSignUpIdentifiersRequiredConnectors } from '../../utils';

import AddButton from './AddButton';
import SignInMethodItem from './SignInMethodItem';
import styles from './index.module.scss';

type Props = {
  readonly signInExperience: SignInExperience;
};

function SignInMethodEditBox({ signInExperience }: Props) {
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

  const { identifiers, password: isSignUpPasswordRequired } = signUp;

  const signUpIdentifiers = identifiers.map(({ identifier }) => identifier);

  const ignoredWarningConnectors = getSignUpIdentifiersRequiredConnectors(signUpIdentifiers);

  const signInIdentifierOptions = signInIdentifiers.filter((candidateIdentifier) =>
    fields.every(({ identifier }) => identifier !== candidateIdentifier)
  );

  const isVerificationCodeCheckable = useCallback(
    (identifier: SignInIdentifier) => {
      if (identifier === SignInIdentifier.Username) {
        return false;
      }

      // Check if the identifier is already used in MFA factors
      const mfaFactors = signInExperience.mfa.factors;
      if (
        (identifier === SignInIdentifier.Email &&
          mfaFactors.includes(MfaFactor.EmailVerificationCode)) ||
        (identifier === SignInIdentifier.Phone &&
          mfaFactors.includes(MfaFactor.PhoneVerificationCode))
      ) {
        return false;
      }

      if (isSignUpPasswordRequired) {
        return true;
      }

      // If the email or phone sign-in method is enabled as one of the sign-up identifiers
      // and password is not required for sign-up, then verification code is required and uncheckable.
      // This is to ensure new users can sign in without password.
      const signUpVerificationRequired = signUpIdentifiers.some(
        (signUpIdentifier) =>
          signUpIdentifier === identifier ||
          signUpIdentifier === AlternativeSignUpIdentifier.EmailOrPhone
      );

      return !signUpVerificationRequired;
    },
    [isSignUpPasswordRequired, signUpIdentifiers, signInExperience.mfa.factors]
  );

  const getVerificationCodeTooltip = useCallback(
    (identifier: SignInIdentifier) => {
      // Return the existing tooltip for sign-up required case
      if (isVerificationCodeCheckable(identifier)) {
        return;
      }

      if (!isSignUpPasswordRequired) {
        return t('sign_in_exp.sign_up_and_sign_in.tip.verification_code_auth');
      }

      // Check if the identifier is already used in MFA factors
      const mfaFactors = signInExperience.mfa.factors;
      if (
        identifier === SignInIdentifier.Email &&
        mfaFactors.includes(MfaFactor.EmailVerificationCode)
      ) {
        return t('sign_in_exp.sign_up_and_sign_in.tip.email_mfa_enabled');
      }
      if (
        identifier === SignInIdentifier.Phone &&
        mfaFactors.includes(MfaFactor.PhoneVerificationCode)
      ) {
        return t('sign_in_exp.sign_up_and_sign_in.tip.phone_mfa_enabled');
      }
    },
    [isVerificationCodeCheckable, isSignUpPasswordRequired, signInExperience.mfa.factors, t]
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
                    isDeletable
                    signInMethod={value}
                    isPasswordCheckable={identifier !== SignInIdentifier.Username}
                    isVerificationCodeCheckable={isVerificationCodeCheckable(value.identifier)}
                    verificationCodeTooltip={getVerificationCodeTooltip(value.identifier)}
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
          append(createSignInMethod(identifier, signInExperience.mfa.factors));
          revalidate();
        }}
      />
    </div>
  );
}

export default SignInMethodEditBox;
