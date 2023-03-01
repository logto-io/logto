import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import { adminTenantEndpoint, meApi } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

type FormFields = {
  password: string;
  confirmPassword: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ChangePasswordModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, register, reset } = useForm<FormFields>();
  const [isLoading, setIsLoading] = useState(false);
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const isDisabled = !password || password !== confirmPassword;

  const onSubmit = async () => {
    setIsLoading(true);
    await api.post(`me/password`, { json: { password } }).json();
    setIsLoading(false);
    onClose();
    toast.success(t('settings.password_changed'));
    reset({});
  };

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title="settings.change_modal_title"
        subtitle="settings.change_modal_description"
        footer={
          <Button
            type="primary"
            title="general.confirm"
            disabled={isDisabled || isLoading}
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        <div>
          <FormField title="settings.new_password">
            <TextInput {...register('password', { required: true })} type="password" />
          </FormField>
          <FormField title="settings.confirm_password">
            <TextInput {...register('confirmPassword', { required: true })} type="password" />
          </FormField>
        </div>
      </ModalLayout>
    </ReactModal>
  );
};

export default ChangePasswordModal;
