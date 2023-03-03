import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import ArrowConnection from '@/assets/images/arrow-connection.svg';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import TextLink from '@/components/TextLink';
import { adminTenantEndpoint, meApi } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';

import MainFlowLikeModal from '../../components/MainFlowLikeModal';

type FormFields = {
  password: string;
};

const VerifyPasswordModal = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const {
    register,
    reset,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    reValidateMode: 'onBlur',
  });
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });

  const onClose = () => {
    navigate('/profile');
  };

  const onSubmit = () => {
    clearErrors();
    void handleSubmit(async ({ password }) => {
      await api.post(`me/password/verify`, { json: { password } }).json();
      reset({});
      navigate('../change-password');
    })();
  };

  return (
    <MainFlowLikeModal
      title="profile.password.enter_password"
      subtitle="profile.password.enter_password_subtitle"
      onClose={onClose}
    >
      <TextInput
        {...register('password', {
          required: t('profile.password.required'),
          minLength: {
            value: 6,
            message: t('profile.password.min_length', { min: 6 }),
          },
        })}
        errorMessage={errors.password?.message}
        type="password"
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
      <TextLink icon={<ArrowConnection />}>{t('profile.code.verify_via_code')}</TextLink>
    </MainFlowLikeModal>
  );
};

export default VerifyPasswordModal;
