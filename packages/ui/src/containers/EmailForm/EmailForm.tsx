import classNames from 'classnames';
import { useCallback } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import Input from '@/components/Input';
import PasswordlessSwitch from '@/containers/PasswordlessSwitch';
import TermsOfUse from '@/containers/TermsOfUse';
import useForm from '@/hooks/use-form';
import useTerms from '@/hooks/use-terms';
import { emailValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  hasTerms?: boolean;
  hasSwitch?: boolean;
  errorMessage?: string;
  submitButtonText?: TFuncKey;
  clearErrorMessage?: () => void;
  onSubmit: (email: string) => Promise<void> | void;
};

type FieldState = {
  email: string;
};

const defaultState: FieldState = { email: '' };

const EmailForm = ({
  autoFocus,
  hasTerms = true,
  hasSwitch = false,
  errorMessage,
  className,
  submitButtonText = 'action.continue',
  clearErrorMessage,
  onSubmit,
}: Props) => {
  const { t } = useTranslation();

  const { termsValidation } = useTerms();
  const { fieldValue, setFieldValue, register, validateForm } = useForm(defaultState);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (hasTerms && !(await termsValidation())) {
        return;
      }

      await onSubmit(fieldValue.email);
    },
    [validateForm, hasTerms, termsValidation, onSubmit, fieldValue.email]
  );

  const { onChange, ...rest } = register('email', emailValidation);

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Input
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder={t('input.email')}
        autoFocus={autoFocus}
        className={styles.inputField}
        onChange={(event) => {
          onChange(event);
          clearErrorMessage?.();
        }}
        {...rest}
        onClear={() => {
          setFieldValue((state) => ({ ...state, email: '' }));
        }}
      />
      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}
      {hasSwitch && <PasswordlessSwitch target="sms" className={styles.switch} />}
      {hasTerms && <TermsOfUse className={styles.terms} />}
      <Button title={submitButtonText} onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default EmailForm;
