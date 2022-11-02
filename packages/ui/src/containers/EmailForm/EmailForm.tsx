import classNames from 'classnames';
import { useCallback } from 'react';
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
  clearErrorMessage?: () => void;
  onSubmit: (email: string) => Promise<void>;
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
  clearErrorMessage,
  className,
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
        // eslint-disable-next-line jsx-a11y/no-autofocus
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
      <Button title="action.continue" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default EmailForm;
