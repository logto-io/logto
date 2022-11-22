import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import DragDropProvider from '@/components/Transfer/DragDropProvider';
import DraggableItem from '@/components/Transfer/DraggableItem';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';
import type { SignInExperienceForm } from '@/pages/SignInExperience/types';

import {
  signInIdentifiers,
  signInIdentifierToRequiredConnectorMapping,
  signUpIdentifierToRequiredConnectorMapping,
  signUpToSignInIdentifierMapping,
} from '../../constants';
import AddButton from './AddButton';
import SignInMethodItem from './SignInMethodItem';
import * as styles from './index.module.scss';
import {
  getSignInMethodPasswordCheckState,
  getSignInMethodVerificationCodeCheckState,
} from './utilities';

const SignInMethodEditBox = () => {
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
      void trigger(`signIn.methods`);
    }
  };

  const { isConnectorTypeEnabled } = useEnabledConnectorTypes();

  if (!signUp) {
    return null;
  }

  const {
    identifier: signUpIdentifier,
    password: isSignUpPasswordRequired,
    verify: isSignUpVerificationRequired,
  } = signUp;

  const requiredSignInIdentifiers = signUpToSignInIdentifierMapping[signUpIdentifier];
  const ignoredWarningConnectors = signUpIdentifierToRequiredConnectorMapping[signUpIdentifier];

  const signInIdentifierOptions = signInIdentifiers.filter((candidateIdentifier) =>
    fields.every(({ identifier }) => identifier !== candidateIdentifier)
  );

  return (
    <div>
      <DragDropProvider>
        {fields.map((signInMethod, index) => {
          const { id, identifier, verificationCode, isPasswordPrimary } = signInMethod;

          const requiredConnectors =
            conditional(
              verificationCode &&
                signInIdentifierToRequiredConnectorMapping[identifier].filter(
                  (connector) => !ignoredWarningConnectors.includes(connector)
                )
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
                      identifier !== SignInIdentifier.Username && !isSignUpPasswordRequired
                    }
                    isVerificationCodeCheckable={
                      !(isSignUpVerificationRequired && !isSignUpPasswordRequired)
                    }
                    isDeletable={!requiredSignInIdentifiers.includes(identifier)}
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
          append({
            identifier,
            password: getSignInMethodPasswordCheckState(identifier, isSignUpPasswordRequired),
            verificationCode: getSignInMethodVerificationCodeCheckState(identifier),
            isPasswordPrimary: true,
          });
        }}
      />
    </div>
  );
};

export default SignInMethodEditBox;
