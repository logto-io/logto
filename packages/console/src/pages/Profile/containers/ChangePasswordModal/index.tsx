import type { KeyboardEventHandler } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import ClearInput from '@/assets/icons/clear-input.svg';
import { adminTenantEndpoint, meApi } from '@/consts';
import Button from '@/ds-components/Button';
import Checkbox from '@/ds-components/Checkbox';
import IconButton from '@/ds-components/IconButton';
import TextInput from '@/ds-components/TextInput';
import { useStaticApi } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import ExperienceLikeModal from '../../components/ExperienceLikeModal';
import { handleError } from '../../utils';

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

function ChangePasswordModal() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const { show: showModal } = useConfirmModal();
  const {
    watch,
    reset,
    register,
    clearErrors,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    reValidateMode: 'onBlur',
    defaultValues,
  });
  const [showPassword, setShowPassword] = useState(false);
  const api = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
    hideErrorToast: true,
  });

  const onClose = () => {
    reset();
    navigate('/profile');
  };

  const onSubmit = () => {
    clearErrors();
    void handleSubmit(async ({ newPassword }) => {
      try {
        await api.post(`me/password`, { json: { password: newPassword } });
        toast.success(t('profile.password_changed'));
        onClose();
      } catch (error: unknown) {
        void handleError(error, async (code, message) => {
          if (code === 'session.verification_failed') {
            await showModal({
              ModalContent: message,
              type: 'alert',
              cancelButtonText: 'general.got_it',
            });
            onClose();

            return true;
          }
        });
      }
    })();
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <ExperienceLikeModal title="profile.password.set_password" onClose={onClose} onGoBack={onClose}>
      <TextInput
        placeholder={t('profile.password.password')}
        {...register('newPassword', {
          required: t('profile.password.required'),
        })}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        type={showPassword ? 'text' : 'password'}
        error={errors.newPassword?.message}
        suffix={
          <IconButton
            onMouseDown={(event) => {
              event.preventDefault();
              setValue('newPassword', '');
            }}
          >
            <ClearInput />
          </IconButton>
        }
        onKeyDown={onKeyDown}
      />
      <TextInput
        placeholder={t('profile.password.confirm_password')}
        {...register('confirmPassword', {
          validate: (value) => value === watch('newPassword') || t('profile.password.do_not_match'),
        })}
        type={showPassword ? 'text' : 'password'}
        error={errors.confirmPassword?.message}
        suffix={
          <IconButton
            onMouseDown={(event) => {
              event.preventDefault();
              setValue('confirmPassword', '');
            }}
          >
            <ClearInput />
          </IconButton>
        }
        onKeyDown={onKeyDown}
      />
      <Checkbox
        checked={showPassword}
        label={t('profile.password.show_password')}
        onChange={() => {
          setShowPassword((value) => !value);
        }}
      />
      <Button
        type="primary"
        title="general.create"
        size="large"
        isLoading={isSubmitting}
        onClick={onSubmit}
      />
    </ExperienceLikeModal>
  );
}

export default ChangePasswordModal;
