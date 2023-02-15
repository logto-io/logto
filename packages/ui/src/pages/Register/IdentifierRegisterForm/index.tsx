import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormState>({
    reValidateMode: 'onChange',
  });

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      void handleSubmit(async ({ identifier }, event) => {
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
      <Controller
        control={control}
        name="identifier"
        rules={{
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
        }}
        render={({ field }) => (
          <SmartInputField
            autoComplete="new-identifier"
            autoFocus={autoFocus}
            className={styles.inputField}
            {...field}
            currentType={inputType}
            isDanger={!!errors.identifier || !!errorMessage}
            errorMessage={errors.identifier?.message}
            enabledTypes={signUpMethods}
            onTypeChange={setInputType}
          />
        )}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <TermsOfUse className={styles.terms} />

      <Button name="submit" title="action.create_account" htmlType="submit" />

      <input hidden type="submit" />
    </form>
  );
};

export default IdentifierRegisterForm;
