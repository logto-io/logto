import { emailRegEx } from '@logto/core-kit';
import { conditional } from '@silverhand/essentials';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import { adminTenantEndpoint, meApi } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';

import MainFlowLikeModal from '../../components/MainFlowLikeModal';
import { checkLocationState } from '../../utils';

type EmailForm = {
  email: string;
};

const LinkEmailModal = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    register,
    reset,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailForm>({
    reValidateMode: 'onBlur',
  });
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });

  const onClose = () => {
    navigate('/profile');
  };

  const onSubmit = () => {
    clearErrors();
    void handleSubmit(async ({ email }) => {
      await api.post(`me/verification-codes`, { json: { email } });
      reset();
      navigate('../verification-code', { state: { email, action: 'changeEmail' } });
    })();
  };

  const currentEmail = conditional(checkLocationState(state) && state.email);

  return (
    <MainFlowLikeModal
      title="profile.link_account.link_email"
      subtitle="profile.link_account.link_email_subtitle"
      onClose={onClose}
    >
      <TextInput
        {...register('email', {
          required: t('profile.link_account.email_required'),
          pattern: { value: emailRegEx, message: t('profile.link_account.invalid_email') },
          validate: (value) =>
            !currentEmail ||
            currentEmail !== value ||
            t('profile.link_account.identical_email_address'),
        })}
        errorMessage={errors.email?.message}
        size="large"
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
    </MainFlowLikeModal>
  );
};

export default LinkEmailModal;
