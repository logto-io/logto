import {
  AlternativeSignUpIdentifier,
  SignInIdentifier,
  type SignUpIdentifier,
} from '@logto/schemas';
import { t } from 'i18next';
import { useCallback, useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { DragDropProvider, DraggableItem } from '@/ds-components/DragDrop';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';
import { type SignInExperienceForm } from '@/pages/SignInExperience/types';

import IdentifiersAddButton from '../../components/IdentifiersAddButton';
import { createSignInMethod, getSignUpIdentifiersRequiredConnectors } from '../../utils';

import SignUpIdentifierItem from './SignUpIdentifierItem';
import styles from './index.module.scss';

const signInIdentifierOptions = Object.values(SignInIdentifier).map((identifier) => ({
  value: identifier,
  label: t(`admin_console.sign_in_exp.sign_up_and_sign_in.identifiers_${identifier}`),
}));

const emailOrPhoneOption = {
  value: AlternativeSignUpIdentifier.EmailOrPhone,
  label: t('admin_console.sign_in_exp.sign_up_and_sign_in.identifiers_email_or_sms'),
};

const signUpIdentifierOptions = [...signInIdentifierOptions, emailOrPhoneOption];

function SignUpIdentifiersEditBox() {
  const {
    control,
    getValues,
    setValue,
    trigger,
    formState: { submitCount },
  } = useFormContext<SignInExperienceForm>();

  const signUpIdentifiers = useWatch({ control, name: 'signUp.identifiers' });

  const { isConnectorTypeEnabled } = useEnabledConnectorTypes();

  const { fields, swap, remove, append } = useFieldArray({
    control,
    name: 'signUp.identifiers',
  });

  // Revalidate the sign-up and sign-in methods,
  //  when appending or removing sign-up identifiers.
  const revalidateForm = useCallback(() => {
    if (submitCount > 0) {
      // Wait for the form re-render before validating the new data.
      setTimeout(() => {
        void trigger('signUp.identifiers');
        void trigger('signIn.methods');
      }, 0);
    }
  }, [submitCount, trigger]);

  /**
   * Append the sign-in methods based on the selected sign-up identifier.
   */
  const appendSignInMethods = useCallback(
    (identifier: SignUpIdentifier) => {
      const signInMethods = getValues('signIn.methods');
      const signInMethodsSet = new Set(signInMethods.map(({ identifier }) => identifier));

      const newSignUpIdentifiers =
        identifier === AlternativeSignUpIdentifier.EmailOrPhone
          ? [SignInIdentifier.Email, SignInIdentifier.Phone]
          : [identifier];

      const newSignInMethods = newSignUpIdentifiers.filter(
        (identifier) => !signInMethodsSet.has(identifier)
      );

      if (newSignInMethods.length === 0) {
        return;
      }

      setValue(
        'signIn.methods',
        signInMethods.concat(newSignInMethods.map((identifier) => createSignInMethod(identifier))),
        {
          shouldDirty: true,
        }
      );
    },
    [getValues, setValue]
  );

  const onAppendSignUpIdentifier = useCallback(
    (identifier: SignUpIdentifier) => {
      appendSignInMethods(identifier);

      if (identifier === SignInIdentifier.Username) {
        setValue('signUp.password', true, {
          // Make sure to trigger the on password change hook
          shouldDirty: true,
        });
      }
    },
    [appendSignInMethods, setValue]
  );

  useEffect(() => {
    if (signUpIdentifiers.length === 0) {
      setValue('signUp.password', false, { shouldDirty: true });
    }

    const isSignUpVerify = signUpIdentifiers.some(
      ({ identifier }) => identifier !== SignInIdentifier.Username
    );
    setValue('signUp.verify', isSignUpVerify, { shouldDirty: true });
  }, [setValue, signUpIdentifiers]);

  const options = useMemo<
    Array<{
      value: SignUpIdentifier;
      label: string;
      disabled?: boolean;
    }>
  >(() => {
    const identifiersSet = new Set(signUpIdentifiers.map(({ identifier }) => identifier));
    const availableOptions = signUpIdentifierOptions.filter(
      ({ value }) => !identifiersSet.has(value)
    );

    return availableOptions.map(({ value, label }) => {
      // Disable email and phone options if email or phone is selected
      if (value === SignInIdentifier.Email || value === SignInIdentifier.Phone) {
        return {
          value,
          label,
          disabled: identifiersSet.has(AlternativeSignUpIdentifier.EmailOrPhone),
        };
      }

      // Disable emailOrPhone option if email or phone is selected
      if (value === AlternativeSignUpIdentifier.EmailOrPhone) {
        return {
          value,
          label,
          disabled:
            identifiersSet.has(SignInIdentifier.Email) ||
            identifiersSet.has(SignInIdentifier.Phone),
        };
      }

      return {
        value,
        label,
      };
    });
  }, [signUpIdentifiers]);

  return (
    <div>
      <DragDropProvider>
        {fields.map((data, index) => {
          const { id, identifier } = data;
          const requiredConnectors = getSignUpIdentifiersRequiredConnectors([identifier]);

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
                name={`signUp.identifiers.${index}`}
                rules={{
                  validate: () => {
                    if (
                      requiredConnectors.some(
                        (connectorType) => !isConnectorTypeEnabled(connectorType)
                      )
                    ) {
                      return false;
                    }

                    return true;
                  },
                }}
                render={({
                  field: {
                    value: { identifier },
                  },
                  fieldState: { error },
                }) => (
                  <SignUpIdentifierItem
                    identifier={identifier}
                    requiredConnectors={requiredConnectors}
                    hasError={Boolean(error)}
                    errorMessage={error?.message}
                    onDelete={() => {
                      remove(index);
                      revalidateForm();
                    }}
                  />
                )}
              />
            </DraggableItem>
          );
        })}
      </DragDropProvider>
      <IdentifiersAddButton
        type="sign-up"
        options={options}
        hasSelectedIdentifiers={signUpIdentifiers.length > 0}
        onSelected={(identifier) => {
          append({ identifier });
          revalidateForm();
          onAppendSignUpIdentifier(identifier);
        }}
      />
    </div>
  );
}

export default SignUpIdentifiersEditBox;
