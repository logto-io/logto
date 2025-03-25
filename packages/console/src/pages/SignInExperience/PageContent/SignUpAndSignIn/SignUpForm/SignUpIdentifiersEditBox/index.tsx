import {
  AlternativeSignUpIdentifier,
  SignInIdentifier,
  type SignUpIdentifier,
} from '@logto/schemas';
import { t } from 'i18next';
import { useMemo } from 'react';
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

function SignUpIdentifiersEditBox() {
  const { control } = useFormContext<SignInExperienceForm>();

  const signUpIdentifiers = useWatch({ control, name: 'signUp.identifiers' });

  const { isConnectorTypeEnabled } = useEnabledConnectorTypes();

  const { fields, swap, remove, append } = useFieldArray({
    control,
    name: 'signUp.identifiers',
  });

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
        }}
      />
    </div>
  );
}

export default SignUpIdentifiersEditBox;
