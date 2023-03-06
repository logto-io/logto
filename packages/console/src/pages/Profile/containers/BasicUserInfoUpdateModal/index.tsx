import type { AdminConsoleKey } from '@logto/phrases';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import { adminTenantEndpoint, meApi } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

export type BasicUserField = 'avatar' | 'username' | 'name';

type Props = {
  field?: BasicUserField;
  value: string;
  isOpen: boolean;
  onClose: () => void;
};

type FormFields = {
  [key in BasicUserField]: string;
};

const BasicUserInfoUpdateModal = ({ field, value: initialValue, isOpen, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });
  const {
    register,
    clearErrors,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ reValidateMode: 'onBlur' });

  useEffect(() => {
    clearErrors();

    if (!field) {
      return;
    }
    setValue(field, initialValue);

    return () => {
      reset();
    };
  }, [clearErrors, field, initialValue, reset, setValue]);

  if (!field) {
    return null;
  }

  const getModalTitle = (): AdminConsoleKey => {
    if (field === 'name') {
      return initialValue ? 'profile.change_name' : 'profile.set_name';
    }

    return `profile.change_${field}`;
  };

  const getInputPlaceholder = (): string => {
    const i18nKey: AdminConsoleKey =
      field === 'avatar' ? 'user_details.field_avatar_placeholder' : `profile.settings.${field}`;

    return t(i18nKey);
  };

  const onSubmit = async () => {
    clearErrors();
    void handleSubmit(async (data) => {
      await api.patch(`me/user`, { json: { [field]: data[field] } });
      toast.success(t('profile.updated', { target: t(`profile.settings.${field}`) }));
      onClose();
    })();
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
        title={getModalTitle()}
        footer={
          <Button
            type="primary"
            size="large"
            title="general.save"
            isLoading={isSubmitting}
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        <div>
          <TextInput
            {...register(field, {
              validate: (value) =>
                field !== 'username' ||
                !!value ||
                t('errors.required_field_missing', { field: t(`profile.settings.${field}`) }),
            })}
            placeholder={getInputPlaceholder()}
            errorMessage={errors[field]?.message}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void onSubmit();
              }
            }}
          />
        </div>
      </ModalLayout>
    </ReactModal>
  );
};

export default BasicUserInfoUpdateModal;
