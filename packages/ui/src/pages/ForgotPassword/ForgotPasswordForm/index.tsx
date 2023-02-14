import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { SmartInputField } from '@/components/InputFields';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import type { VerificationCodeIdentifier } from '@/types';
import { UserFlow } from '@/types';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  defaultValue?: string;
  defaultType: VerificationCodeIdentifier;
  enabledTypes: VerificationCodeIdentifier[];
};

type FormState = {
  identifier: string;
};

const ForgotPasswordForm = ({
  className,
  autoFocus,
  defaultType,
  defaultValue = '',
  enabledTypes,
}: Props) => {
  const { t } = useTranslation();
  const [inputType, setInputType] = useState<VerificationCodeIdentifier>(defaultType);
  const { errorMessage, clearErrorMessage, onSubmit } = useSendVerificationCode(
    UserFlow.forgotPassword
  );

  const {
    setValue,
    handleSubmit,
    control,
    formState: { errors, isSubmitted },
  } = useForm<FormState>({
    reValidateMode: 'onChange',
    defaultValues: { identifier: defaultValue },
  });

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      void handleSubmit(async ({ identifier }, event) => {
        event?.preventDefault();

        await onSubmit({ identifier: inputType, value: identifier });
      })(event);
    },
    [clearErrorMessage, handleSubmit, inputType, onSubmit]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Controller
        control={control}
        name="identifier"
        rules={{
          required: getGeneralIdentifierErrorMessage(enabledTypes, 'required'),
          validate: (value) => {
            const errorMessage = validateIdentifierField(inputType, value);

            if (errorMessage) {
              return typeof errorMessage === 'string'
                ? t(`error.${errorMessage}`)
                : t(`error.${errorMessage.code}`, errorMessage.data);
            }

            return true;
          },
        }}
        render={({ field }) => (
          <SmartInputField
            autoComplete="identifier"
            autoFocus={autoFocus}
            className={styles.inputField}
            {...field}
            defaultValue={defaultValue}
            currentType={inputType}
            isDanger={!!errors.identifier}
            errorMessage={errors.identifier?.message}
            enabledTypes={enabledTypes}
            onTypeChange={(type) => {
              // The enabledTypes is restricted to be VerificationCodeIdentifier, need this check to make TS happy
              if (type !== SignInIdentifier.Username) {
                setInputType(type);
              }
            }}
            /* Overwrite default input onChange handler  */
            onChange={(value) => {
              setValue('identifier', value, { shouldValidate: isSubmitted, shouldDirty: true });
            }}
          />
        )}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <Button title="action.continue" htmlType="submit" />

      <input hidden type="submit" />
    </form>
  );
};

export default ForgotPasswordForm;
