import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import type { IdentifierInputType } from '@/components/InputFields';
import { SmartInputField } from '@/components/InputFields';
import TermsOfUse from '@/containers/TermsOfUse';
import useTerms from '@/hooks/use-terms';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import * as styles from './index.module.scss';
import useOnSubmit from './use-on-submit';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  signUpMethods: SignInIdentifier[];
};

type FormState = {
  identifier: string;
};

const IdentifierRegisterForm = ({ className, autoFocus, signUpMethods }: Props) => {
  const { t } = useTranslation();
  const { termsValidation } = useTerms();
  const [inputType, setInputType] = useState<IdentifierInputType>(
    signUpMethods[0] ?? SignInIdentifier.Username
  );

  const { errorMessage, clearErrorMessage, onSubmit } = useOnSubmit();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<FormState>({
    reValidateMode: 'onChange',
    defaultValues: { identifier: '' },
  });

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      void handleSubmit(async ({ identifier }, event) => {
        event?.preventDefault();

        if (!(await termsValidation())) {
          return;
        }

        await onSubmit(inputType, identifier);
      })(event);
    },
    [clearErrorMessage, handleSubmit, inputType, onSubmit, termsValidation]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <SmartInputField
        required
        autoComplete="new-identifier"
        autoFocus={autoFocus}
        className={styles.inputField}
        currentType={inputType}
        isDanger={!!errors.identifier || !!errorMessage}
        errorMessage={errors.identifier?.message}
        enabledTypes={signUpMethods}
        onTypeChange={setInputType}
        {...register('identifier', {
          required: getGeneralIdentifierErrorMessage(signUpMethods, 'required'),
          validate: (value) => {
            const errorMessage = validateIdentifierField(inputType, value);

            if (errorMessage) {
              return typeof errorMessage === 'string'
                ? t(`error.${errorMessage}`)
                : t(`error.${errorMessage.code}`, errorMessage.data);
            }

            return true;
          },
        })}
        /* Overwrite default input onChange handler  */
        onChange={(value) => {
          setValue('identifier', value, { shouldValidate: isSubmitted, shouldDirty: true });
        }}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <TermsOfUse className={styles.terms} />

      <Button name="submit" title="action.create_account" htmlType="submit" />

      <input hidden type="submit" />
    </form>
  );
};

export default IdentifierRegisterForm;
