import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useContext, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import LockIcon from '@/assets/icons/lock.svg?react';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import SmartInputField, {
  type IdentifierInputValue,
} from '@/components/InputFields/SmartInputField';
import useOnSubmit from '@/hooks/use-check-single-sign-on';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import styles from './index.module.scss';

type FormState = {
  identifier: IdentifierInputValue;
};

const SingleSignOnEmail = () => {
  const { errorMessage, clearErrorMessage, onSubmit } = useOnSubmit();
  const { ssoEmail } = useContext(UserInteractionContext);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormState>({
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (!isValid) {
      clearErrorMessage();
    }
  }, [clearErrorMessage, isValid]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();
      await handleSubmit(async ({ identifier: { value } }) => onSubmit(value, true))(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit]
  );

  return (
    <SecondaryPageLayout
      title="action.single_sign_on"
      description="description.single_sign_on_email_form"
    >
      <form className={styles.form} onSubmit={onSubmitHandler}>
        <Controller
          control={control}
          name="identifier"
          rules={{
            validate: ({ value }) => {
              if (!value) {
                return getGeneralIdentifierErrorMessage([SignInIdentifier.Email], 'required');
              }

              const errorMessage = validateIdentifierField(SignInIdentifier.Email, value);

              return errorMessage
                ? getGeneralIdentifierErrorMessage([SignInIdentifier.Email], 'invalid')
                : true;
            },
          }}
          render={({ field }) => (
            <SmartInputField
              autoFocus
              className={styles.inputField}
              {...field}
              isDanger={!!errors.identifier}
              defaultValue={ssoEmail}
              errorMessage={errors.identifier?.message}
              enabledTypes={[SignInIdentifier.Email]}
            />
          )}
        />

        {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

        <Button
          title="action.single_sign_on"
          htmlType="submit"
          icon={<LockIcon />}
          isLoading={isSubmitting}
        />

        <input hidden type="submit" />
      </form>
    </SecondaryPageLayout>
  );
};

export default SingleSignOnEmail;
