import classNames from 'classnames';
import { useEffect, useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { resetPassword } from '@/apis/forgot-password';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import Input from '@/components/Input';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useForm from '@/hooks/use-form';
import { PageContext } from '@/hooks/use-page-context';
import { passwordValidation, confirmPasswordValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

type FieldState = {
  password: string;
  confirmPassword: string;
};

const defaultState: FieldState = {
  password: '',
  confirmPassword: '',
};

const ResetPassword = ({ className, autoFocus }: Props) => {
  const { t } = useTranslation();
  const { setToast } = useContext(PageContext);
  const {
    fieldValue,
    formErrorMessage,
    setFieldValue,
    register,
    validateForm,
    setFormErrorMessage,
  } = useForm(defaultState);
  const { show } = useConfirmModal();
  const navigate = useNavigate();

  const resetPasswordErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.verification_session_not_found': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-1);
      },
      'session.verification_expired': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-1);
      },
      'user.same_password': (error) => {
        setFormErrorMessage(error.message);
      },
    }),
    [navigate, setFormErrorMessage, show]
  );

  const { result, run: asyncRegister } = useApi(resetPassword, resetPasswordErrorHandlers);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      setFormErrorMessage(undefined);

      if (!validateForm()) {
        return;
      }

      void asyncRegister(fieldValue.password);
    },
    [setFormErrorMessage, validateForm, asyncRegister, fieldValue.password]
  );

  useEffect(() => {
    if (result) {
      setToast(t('description.password_changed'));
      navigate('/sign-in', { replace: true });
    }
  }, [navigate, result, setToast, t]);

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Input
        className={styles.inputField}
        name="new-password"
        type="password"
        autoComplete="new-password"
        placeholder={t('input.password')}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        {...register('password', passwordValidation)}
        onClear={() => {
          setFieldValue((state) => ({ ...state, password: '' }));
        }}
      />
      <Input
        className={styles.inputField}
        name="confirm-new-password"
        type="password"
        placeholder={t('input.confirm_password')}
        {...register('confirmPassword', (confirmPassword) =>
          confirmPasswordValidation(fieldValue.password, confirmPassword)
        )}
        isErrorStyling={false}
        onClear={() => {
          setFieldValue((state) => ({ ...state, confirmPassword: '' }));
        }}
      />
      {formErrorMessage && (
        <ErrorMessage className={styles.formErrors}>{formErrorMessage}</ErrorMessage>
      )}

      <Button title="action.save_password" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default ResetPassword;
