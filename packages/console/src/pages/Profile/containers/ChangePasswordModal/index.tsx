import type { KeyboardEventHandler } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import Checkbox from '@/components/Checkbox';
import TextInput from '@/components/TextInput';
import { adminTenantEndpoint, meApi } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';

import MainFlowLikeModal from '../../components/MainFlowLikeModal';

type FormFields = {
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
};

const defaultValues: FormFields = {
  newPassword: '',
  confirmPassword: '',
  showPassword: false,
};

const ChangePasswordModal = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    watch,
    reset,
    register,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    reValidateMode: 'onBlur',
    defaultValues,
  });
  const [showPassword, setShowPassword] = useState(false);
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });

  const onClose = () => {
    navigate('/profile');
  };

  const onSubmit = () => {
    clearErrors();
    void handleSubmit(async ({ newPassword }) => {
      await api.post(`me/password`, { json: { password: newPassword } });
      toast.success(t('settings.password_changed'));
      reset();
      onClose();
    })();
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <MainFlowLikeModal
      title="profile.password.set_password"
      onClose={onClose}
      onGoBack={() => {
        navigate('../verify-password', { state });
      }}
    >
      <TextInput
        placeholder={t('profile.password.password')}
        {...register('newPassword', {
          required: t('profile.password.required'),
          minLength: {
            value: 6,
            message: t('profile.password.min_length', { min: 6 }),
          },
        })}
        type={showPassword ? 'text' : 'password'}
        errorMessage={errors.newPassword?.message}
        onKeyDown={onKeyDown}
      />
      <TextInput
        placeholder={t('profile.password.confirm_password')}
        {...register('confirmPassword', {
          validate: (value) => value === watch('newPassword') || t('profile.password.do_not_match'),
        })}
        type={showPassword ? 'text' : 'password'}
        errorMessage={errors.confirmPassword?.message}
        onKeyDown={onKeyDown}
      />
      <Checkbox
        checked={showPassword}
        label={t('profile.password.show_password')}
        onChange={() => {
          setShowPassword((show) => !show);
        }}
      />
      <Button type="primary" title="general.create" isLoading={isSubmitting} onClick={onSubmit} />
    </MainFlowLikeModal>
  );
};

export default ChangePasswordModal;
