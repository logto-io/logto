import { emailRegEx } from '@logto/core-kit';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { adminTenantEndpoint, meApi } from '@/consts';
import Button from '@/ds-components/Button';
import TextInput from '@/ds-components/TextInput';
import { useStaticApi } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { trySubmitSafe } from '@/utils/form';

import ExperienceLikeModal from '../../components/ExperienceLikeModal';
import { parseLocationState } from '../../utils';

type EmailForm = {
  email: string;
};

function LinkEmailModal() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
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
    void handleSubmit(
      trySubmitSafe(async ({ email }) => {
        await api.post(`me/verification-codes`, { json: { email } });
        reset();
        navigate('../verification-code', { state: { email, action: 'changeEmail' } });
      })
    )();
  };

  const { email: currentEmail } = parseLocationState(state);

  return (
    <ExperienceLikeModal
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
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        error={errors.email?.message}
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
    </ExperienceLikeModal>
  );
}

export default LinkEmailModal;
