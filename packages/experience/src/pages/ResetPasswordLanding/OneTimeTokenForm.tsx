import {
  SignInIdentifier,
  type OneTimeTokenVerificationVerifyPayload,
  type RequestErrorBody,
} from '@logto/schemas';
import classNames from 'classnames';
import { HTTPError, TimeoutError } from 'ky';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { identifyForgotPasswordWithOneTimeToken } from '@/apis/experience';
import { SmartInputField } from '@/components/InputFields';
import useApi from '@/hooks/use-api';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import Button from '@/shared/components/Button';
import LoadingLayer from '@/shared/components/LoadingLayer';
import { UserFlow } from '@/types';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import styles from '../ForgotPassword/ForgotPasswordForm/index.module.scss';

import type { ResetPasswordMagicLinkError } from './types';

type Props = {
  readonly className?: string;
  readonly token: string;
  readonly loginHint?: string;
  readonly onError: (error: ResetPasswordMagicLinkError) => void;
};

type FormState = {
  identifier: {
    type?: SignInIdentifier.Email;
    value: string;
  };
};

const emailIdentifier = [SignInIdentifier.Email];

const OneTimeTokenForm = ({ className, token, loginHint = '', onError }: Props) => {
  const { t } = useTranslation();
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const isAutoSubmitted = useRef(false);
  const navigate = useNavigateWithPreservedSearchParams();
  const asyncIdentifyForgotPasswordWithOneTimeToken = useApi(
    identifyForgotPasswordWithOneTimeToken
  );
  const { setForgotPasswordIdentifierInputValue } = useContext(UserInteractionContext);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormState>({
    reValidateMode: 'onBlur',
    defaultValues: {
      identifier: {
        value: loginHint,
      },
    },
  });

  const submit = useCallback(
    async (payload: OneTimeTokenVerificationVerifyPayload) => {
      const [error] = await asyncIdentifyForgotPasswordWithOneTimeToken(payload);

      if (error) {
        if (error instanceof HTTPError) {
          try {
            const { code, message } = await error.response.json<RequestErrorBody>();

            onError(
              code === 'guard.invalid_input'
                ? { message: 'error.invalid_email' }
                : { rawMessage: message }
            );
          } catch {
            onError({ message: 'error.unknown' });
          }
        } else if (error instanceof TimeoutError) {
          onError({ message: 'error.timeout' });
        } else {
          onError({ message: 'error.unknown' });
        }

        return;
      }

      const { identifier } = payload;
      setForgotPasswordIdentifierInputValue(identifier);
      navigate(`/${UserFlow.ForgotPassword}/reset`, { replace: true });
    },
    [
      asyncIdentifyForgotPasswordWithOneTimeToken,
      navigate,
      onError,
      setForgotPasswordIdentifierInputValue,
    ]
  );

  useEffect(() => {
    if (isAutoSubmitted.current) {
      return;
    }

    if (loginHint.length === 0) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation -- React ref guards one-time auto submit
    isAutoSubmitted.current = true;
    setIsAutoSubmitting(true);
    void (async () => {
      try {
        await submit({
          token,
          identifier: { type: SignInIdentifier.Email, value: loginHint },
        });
      } finally {
        setIsAutoSubmitting(false);
      }
    })();
  }, [loginHint, submit, token]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      if (isAutoSubmitting) {
        return;
      }

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
    [handleSubmit, isAutoSubmitting, submit, token]
  );

  const isVerificationPending = isSubmitting || isAutoSubmitting;

  if (loginHint) {
    return <LoadingLayer />;
  }

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
            disabled={isVerificationPending}
            isDanger={!!errors.identifier}
            errorMessage={errors.identifier?.message}
            enabledTypes={emailIdentifier}
          />
        )}
      />

      <Button title="action.continue" htmlType="submit" isLoading={isVerificationPending} />

      <input hidden disabled={isVerificationPending} type="submit" />
    </form>
  );
};

export default OneTimeTokenForm;
