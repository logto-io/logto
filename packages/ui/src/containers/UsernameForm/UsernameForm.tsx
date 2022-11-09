import type { I18nKey } from '@logto/phrases-ui';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import Input from '@/components/Input';
import TermsOfUse from '@/containers/TermsOfUse';
import useForm from '@/hooks/use-form';
import useTerms from '@/hooks/use-terms';
import { usernameValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  hasTerms?: boolean;
  onSubmit: (username: string) => Promise<void>;
  errorMessage?: string;
  clearErrorMessage?: () => void;
  submitText?: I18nKey;
};

type FieldState = {
  username: string;
};

const defaultState: FieldState = {
  username: '',
};

const UsernameForm = ({
  className,
  hasTerms = true,
  onSubmit,
  errorMessage,
  submitText = 'action.create',
  clearErrorMessage,
}: Props) => {
  const { t } = useTranslation();
  const { termsValidation } = useTerms();

  const {
    fieldValue,
    setFieldValue,
    register: fieldRegister,
    validateForm,
  } = useForm(defaultState);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      clearErrorMessage?.();

      if (!validateForm()) {
        return;
      }

      if (hasTerms && !(await termsValidation())) {
        return;
      }

      void onSubmit(fieldValue.username);
    },
    [clearErrorMessage, validateForm, hasTerms, termsValidation, onSubmit, fieldValue.username]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Input
        name="new-username"
        className={styles.inputField}
        placeholder={t('input.username')}
        {...fieldRegister('username', usernameValidation)}
        onClear={() => {
          setFieldValue((state) => ({ ...state, username: '' }));
        }}
      />
      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      {hasTerms && <TermsOfUse className={styles.terms} />}

      <Button title={submitText} onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default UsernameForm;
