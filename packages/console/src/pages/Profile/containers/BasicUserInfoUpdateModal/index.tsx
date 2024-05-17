import type { AdminConsoleKey } from '@logto/phrases';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import { adminTenantEndpoint, meApi } from '@/consts';
import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import ImageUploaderField from '@/ds-components/Uploader/ImageUploaderField';
import { useStaticApi } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import * as modalStyles from '@/scss/modal.module.scss';

import { handleError } from '../../utils';

export type BasicUserField = 'avatar' | 'username' | 'name';

type Props = {
  readonly field?: BasicUserField;
  readonly value: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

type FormFields = {
  [key in BasicUserField]: string;
};

function BasicUserInfoUpdateModal({ field, value: initialValue, isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { show: showModal } = useConfirmModal();
  const api = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
    hideErrorToast: true,
  });
  const {
    register,
    clearErrors,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ reValidateMode: 'onBlur' });
  const { isReady: isUserAssetsServiceReady } = useUserAssetsService();

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
      try {
        await api.patch('me', { json: { [field]: data[field] } });
        toast.success(t('profile.updated', { target: t(`profile.settings.${field}`) }));
        onClose();
      } catch (error: unknown) {
        void handleError(error, async (_, message, status) => {
          if (status === 422) {
            await showModal({
              ModalContent: message,
              type: 'alert',
              cancelButtonText: 'general.got_it',
            });

            return true;
          }
        });
      }
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
        {field === 'avatar' && isUserAssetsServiceReady ? (
          <Controller
            name="avatar"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <ImageUploaderField
                name={name}
                value={value}
                uploadUrl="me/user-assets"
                apiInstance={api}
                onChange={onChange}
              />
            )}
          />
        ) : (
          <TextInput
            {...register(field, {
              validate: (value) =>
                field !== 'username' ||
                !!value ||
                t('errors.required_field_missing', { field: t(`profile.settings.${field}`) }),
            })}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder={getInputPlaceholder()}
            error={errors[field]?.message}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void onSubmit();
              }
            }}
          />
        )}
      </ModalLayout>
    </ReactModal>
  );
}

export default BasicUserInfoUpdateModal;
