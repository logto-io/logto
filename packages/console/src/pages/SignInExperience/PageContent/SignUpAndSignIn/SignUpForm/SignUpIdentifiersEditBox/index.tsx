import {
  AlternativeSignUpIdentifier,
  SignInIdentifier,
  type SignUpIdentifier,
} from '@logto/schemas';
import { t } from 'i18next';
import { useCallback, useMemo } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { DragDropProvider, DraggableItem } from '@/ds-components/DragDrop';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';
import { type SignInExperienceForm } from '@/pages/SignInExperience/types';

import IdentifiersAddButton from '../../components/IdentifiersAddButton';
import { getSignUpIdentifiersRequiredConnectors } from '../../utils';

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

type Props = {
  /**
   * Sync the sign-in methods when the sign-up settings change.
   */
  readonly syncSignInMethods: () => void;
};

function SignUpIdentifiersEditBox({ syncSignInMethods }: Props) {
  const { control, getValues, setValue } = useFormContext<SignInExperienceForm>();

  const signUpIdentifiers = useWatch({ control, name: 'signUp.identifiers' });

  const { isConnectorTypeEnabled } = useEnabledConnectorTypes();

  const { fields, swap, remove, append } = useFieldArray({
    control,
    name: 'signUp.identifiers',
  });

  // Revalidate the primary identifier authentication fields when the identifiers change
  const onSignUpIdentifiersChange = useCallback(() => {
    const identifiers = getValues('signUp.identifiers').map(({ identifier }) => identifier);
    setValue('signUp.verify', identifiers[0] !== SignInIdentifier.Username);
    syncSignInMethods();
  }, [getValues, setValue, syncSignInMethods]);

  const onDeleteSignUpIdentifier = useCallback(() => {
    const identifiers = getValues('signUp.identifiers').map(({ identifier }) => identifier);

    if (identifiers.length === 0) {
      setValue('signUp.password', false);
      setValue('signUp.verify', false);
      // Password changed need to sync sign-in methods
      syncSignInMethods();
      return;
    }

    onSignUpIdentifiersChange();
  }, [getValues, onSignUpIdentifiersChange, setValue, syncSignInMethods]);

  const onAppendSignUpIdentifier = useCallback(
    (identifier: SignUpIdentifier) => {
      if (identifier === SignInIdentifier.Username) {
        setValue('signUp.password', true);
      }
      onSignUpIdentifiersChange();
    },
    [onSignUpIdentifiersChange, setValue]
  );

  const options = useMemo<
    Array<{
      value: SignUpIdentifier;
      label: string;
    }>
  >(() => {
    const identifiersSet = new Set(signUpIdentifiers.map(({ identifier }) => identifier));

    return signUpIdentifierOptions.filter(({ value }) => {
      // Basic condition: filter out if identifiers include the value
      if (identifiersSet.has(value)) {
        return false;
      }

      // Condition 2: If identifiers include EmailOrPhone, filter out Email and Phone
      if (
        identifiersSet.has(AlternativeSignUpIdentifier.EmailOrPhone) &&
        (value === SignInIdentifier.Email || value === SignInIdentifier.Phone)
      ) {
        return false;
      }

      // Condition 3: If identifiers include Email or Phone, filter out EmailOrPhone
      if (
        (identifiersSet.has(SignInIdentifier.Email) ||
          identifiersSet.has(SignInIdentifier.Phone)) &&
        value === AlternativeSignUpIdentifier.EmailOrPhone
      ) {
        return false;
      }

      // If none of the conditions matched, keep the value
      return true;
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
              moveItem={(dragIndex, hoverIndex) => {
                swap(dragIndex, hoverIndex);
                onSignUpIdentifiersChange();
              }}
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
                      onDeleteSignUpIdentifier();
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
          onAppendSignUpIdentifier(identifier);
        }}
      />
    </div>
  );
}

export default SignUpIdentifiersEditBox;
