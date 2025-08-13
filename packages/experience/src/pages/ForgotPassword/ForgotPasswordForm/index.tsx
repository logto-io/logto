import classNames from 'classnames';
import { useCallback, useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { SmartInputField } from '@/components/InputFields';
import CaptchaBox from '@/containers/CaptchaBox';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import type { VerificationCodeIdentifier } from '@/types';
import { UserFlow } from '@/types';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
  readonly defaultValue?: string;
  readonly enabledTypes: VerificationCodeIdentifier[];
};

type FormState = {
  identifier: {
    type?: VerificationCodeIdentifier;
    value: string;
  };
};

const ForgotPasswordForm = ({ className, autoFocus, defaultValue = '', enabledTypes }: Props) => {
  const { t } = useTranslation();
  const { errorMessage, clearErrorMessage, onSubmit } = useSendVerificationCode(
    UserFlow.ForgotPassword
  );

  const { setForgotPasswordIdentifierInputValue } = useContext(UserInteractionContext);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormState>({
    reValidateMode: 'onBlur',
    defaultValues: {
      identifier: {
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

      await handleSubmit(async ({ identifier: { type, value } }) => {
        if (!type) {
          return;
        }

        // Cache or update the forgot password identifier input value
        setForgotPasswordIdentifierInputValue({ type, value });

        await onSubmit({ identifier: type, value });
      })(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit, setForgotPasswordIdentifierInputValue]
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
        render={({ field, formState: { defaultValues } }) => (
          <SmartInputField
            autoFocus={autoFocus}
            className={styles.inputField}
            {...field}
            defaultValue={defaultValues?.identifier?.value}
            isDanger={!!errors.identifier}
            errorMessage={errors.identifier?.message}
            enabledTypes={enabledTypes}
          />
        )}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <CaptchaBox />
      <Button title="action.continue" htmlType="submit" isLoading={isSubmitting} />

      <input hidden type="submit" />
    </form>
  );
};

export default ForgotPasswordForm;
