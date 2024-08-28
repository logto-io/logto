import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
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
  readonly className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
  readonly defaultValue?: string;
  readonly defaultType: VerificationCodeIdentifier;
  readonly enabledTypes: VerificationCodeIdentifier[];
};

type FormState = {
  identifier: {
    type?: VerificationCodeIdentifier;
    value: string;
  };
};

const ForgotPasswordForm = ({
  className,
  autoFocus,
  defaultType,
  defaultValue = '',
  enabledTypes,
}: Props) => {
  const { t } = useTranslation();
  const { errorMessage, clearErrorMessage, onSubmit } = useSendVerificationCode(
    UserFlow.ForgotPassword
  );

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormState>({
    reValidateMode: 'onBlur',
    defaultValues: {
      identifier: {
        type: defaultType,
        value: defaultValue,
      },
    },
  });

  useEffect(() => {
    if (!isValid) {
      clearErrorMessage();
    }
  }, [clearErrorMessage, isValid]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      void handleSubmit(async ({ identifier: { type, value } }) => {
        if (!type) {
          return;
        }

        await onSubmit({ identifier: type, value });
      })(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Controller
        control={control}
        name="identifier"
        rules={{
          validate: (identifier) => {
            const { type, value } = identifier;

            if (!type || !value) {
              return getGeneralIdentifierErrorMessage(enabledTypes, 'required');
            }

            const errorMessage = validateIdentifierField(type, value);

            if (errorMessage) {
              return typeof errorMessage === 'string'
                ? t(`error.${errorMessage}`)
                : t(`error.${errorMessage.code}`, errorMessage.data ?? {});
            }

            return true;
          },
        }}
        render={({ field }) => (
          <SmartInputField
            autoFocus={autoFocus}
            className={styles.inputField}
            {...field}
            defaultType={defaultType}
            defaultValue={defaultValue}
            isDanger={!!errors.identifier}
            errorMessage={errors.identifier?.message}
            enabledTypes={enabledTypes}
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
