import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import ArrowConnection from '@/assets/icons/arrow-connection.svg?react';
import PasswordHideIcon from '@/assets/icons/password-hide.svg?react';
import PasswordShowIcon from '@/assets/icons/password-show.svg?react';
import { adminTenantEndpoint, meApi } from '@/consts';
import Button from '@/ds-components/Button';
import IconButton from '@/ds-components/IconButton';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import { useStaticApi } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import ExperienceLikeModal from '../../components/ExperienceLikeModal';
import { handleError, parseLocationState } from '../../utils';

import styles from './index.module.scss';

type FormFields = {
  password: string;
};

function VerifyPasswordModal() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const { state } = useLocation();
  const {
    register,
    reset,
    clearErrors,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    reValidateMode: 'onBlur',
  });
  const api = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
    hideErrorToast: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const { email } = parseLocationState(state);

  const onClose = () => {
    navigate('/profile');
  };

  const onSubmit = () => {
    clearErrors();
    void handleSubmit(async ({ password }) => {
      try {
        await api.post(`me/password/verify`, { json: { password } });
        reset();
        navigate('../change-password', { state });
      } catch (error: unknown) {
        void handleError(error, async (code, message) => {
          if (code === 'session.invalid_credentials') {
            setError('password', { type: 'custom', message });

            return true;
          }
        });
      }
    })();
  };

  return (
    <ExperienceLikeModal
      title="profile.password.enter_password"
      subtitle="profile.password.enter_password_subtitle"
      onClose={onClose}
      onGoBack={onClose}
    >
      <TextInput
        {...register('password', { required: t('profile.password.required') })}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        error={errors.password?.message}
        type={showPassword ? 'text' : 'password'}
        suffix={
          <IconButton
            onMouseDown={(event) => {
              event.preventDefault();
              setShowPassword((flag) => !flag);
            }}
          >
            {showPassword ? <PasswordShowIcon /> : <PasswordHideIcon />}
          </IconButton>
        }
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSubmit();
          }
        }}
      />
      <Button
        type="primary"
        size="large"
        title="general.continue"
        isLoading={isSubmitting}
        onClick={onSubmit}
      />
      {email && (
        <TextLink
          className={styles.link}
          icon={<ArrowConnection />}
          onClick={() => {
            void api.post('me/verification-codes', { json: { email } });
            navigate('../verification-code', { state });
          }}
        >
          {t('profile.code.verify_via_code')}
        </TextLink>
      )}
    </ExperienceLikeModal>
  );
}

export default VerifyPasswordModal;
