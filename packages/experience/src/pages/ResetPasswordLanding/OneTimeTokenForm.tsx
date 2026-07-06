import { SignInIdentifier, type OneTimeTokenVerificationVerifyPayload } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { identifyForgotPasswordWithOneTimeToken } from '@/apis/experience';
import { SmartInputField } from '@/components/InputFields';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import Button from '@/shared/components/Button';
import ErrorMessage from '@/shared/components/ErrorMessage';
import { UserFlow } from '@/types';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import styles from '../ForgotPassword/ForgotPasswordForm/index.module.scss';

type Props = {
  readonly className?: string;
  readonly token: string;
  readonly loginHint?: string;
};

type FormState = {
  identifier: {
    type?: SignInIdentifier.Email;
    value: string;
  };
};

const emailIdentifier = [SignInIdentifier.Email];

const OneTimeTokenForm = ({ className, token, loginHint = '' }: Props) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string>();
  const isAutoSubmitted = useRef(false);
  const navigate = useNavigate();
  const handleError = useErrorHandler();
  const asyncIdentifyForgotPasswordWithOneTimeToken = useApi(
    identifyForgotPasswordWithOneTimeToken
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
        value: loginHint,
      },
    },
  });

  useEffect(() => {
    if (!isValid) {
      setErrorMessage(undefined);
    }
  }, [isValid]);

  const submit = useCallback(
    async (payload: OneTimeTokenVerificationVerifyPayload) => {
      setErrorMessage(undefined);

      const [error] = await asyncIdentifyForgotPasswordWithOneTimeToken(payload);

      if (error) {
        await handleError(error, {
          'guard.invalid_input': () => {
            setErrorMessage(t('error.invalid_email'));
          },
          global: (error) => {
            setErrorMessage(error.message);
          },
        });
        return;
      }

      const { identifier } = payload;
      setForgotPasswordIdentifierInputValue(identifier);
      navigate(`/${UserFlow.ForgotPassword}/reset`, { replace: true });
    },
    [
      asyncIdentifyForgotPasswordWithOneTimeToken,
      handleError,
      navigate,
      setForgotPasswordIdentifierInputValue,
      t,
    ]
  );

  useEffect(() => {
    if (isAutoSubmitted.current) {
      return;
    }

    if (loginHint.length === 0) {
      return;
    }

    if (validateIdentifierField(SignInIdentifier.Email, loginHint)) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation -- React ref guards one-time auto submit
    isAutoSubmitted.current = true;
    void submit({
      token,
      identifier: { type: SignInIdentifier.Email, value: loginHint },
    });
  }, [loginHint, submit, token]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      await handleSubmit(async ({ identifier: { type, value } }) => {
        if (!type) {
          return;
        }

        await submit({
          token,
          identifier: { type, value },
        });
      })(event);
    },
    [handleSubmit, submit, token]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Controller
        control={control}
        name="identifier"
        rules={{
          validate: (identifier) => {
            const { type, value } = identifier;

            if (!type || value.length === 0) {
              return getGeneralIdentifierErrorMessage(emailIdentifier, 'required');
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
            autoFocus
            className={styles.inputField}
            {...field}
            defaultValue={defaultValues?.identifier?.value}
            isDanger={!!errors.identifier}
            errorMessage={errors.identifier?.message}
            enabledTypes={emailIdentifier}
          />
        )}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <Button title="action.continue" htmlType="submit" isLoading={isSubmitting} />

      <input hidden type="submit" />
    </form>
  );
};

export default OneTimeTokenForm;
