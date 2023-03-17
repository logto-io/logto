import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import ArrowConnection from '@/assets/images/arrow-connection.svg';
import PasswordHideIcon from '@/assets/images/password-hide.svg';
import PasswordShowIcon from '@/assets/images/password-show.svg';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import TextInput from '@/components/TextInput';
import TextLink from '@/components/TextLink';
import { adminTenantEndpoint, meApi } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';

import MainFlowLikeModal from '../../components/MainFlowLikeModal';
import { checkLocationState, handleError } from '../../utils';
import * as styles from './index.module.scss';

type FormFields = {
  password: string;
};

const VerifyPasswordModal = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
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
  const email = conditional(checkLocationState(state) && state.email);

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
    <MainFlowLikeModal
      title="profile.password.enter_password"
      subtitle="profile.password.enter_password_subtitle"
      onClose={onClose}
      onGoBack={onClose}
    >
      <TextInput
        {...register('password', { required: t('profile.password.required') })}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        errorMessage={errors.password?.message}
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
    </MainFlowLikeModal>
  );
};

export default VerifyPasswordModal;
