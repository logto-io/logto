import { SentinelActivityTargetType } from '@logto/schemas';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import MultiOptionInput from '@/components/MultiOptionInput/index.js';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField/index.js';
import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api.js';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form.js';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

type UnlockIdentifiersForm = {
  identifiers: string[];
};

function SentinelUnlockModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.security',
  });

  const api = useApi();

  const {
    control,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    handleSubmit,
    reset,
    watch,
  } = useForm<UnlockIdentifiersForm>({
    defaultValues: {
      identifiers: [],
    },
  });

  const onCloseHandler = useCallback(() => {
    reset({ identifiers: [] });
    onClose();
  }, [onClose, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async ({ identifiers }: UnlockIdentifiersForm) => {
      if (isSubmitting || identifiers.length === 0) {
        return;
      }

      await api.post('api/sentinel-activities/delete', {
        json: {
          targetType: SentinelActivityTargetType.User,
          targets: identifiers,
        },
      });

      toast.success(t('sentinel_policy.manual_unlock.success_toast'));
      onCloseHandler();
    })
  );

  return (
    <Modal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onCloseHandler}
    >
      <ModalLayout
        title="security.sentinel_policy.manual_unlock.title"
        footer={
          <>
            <Button isLoading={isSubmitting} title="general.cancel" onClick={onCloseHandler} />
            <Button
              isLoading={isSubmitting}
              type="primary"
              title="security.sentinel_policy.manual_unlock.confirm_button_text"
              onClick={onSubmit}
            />
          </>
        }
        onClose={onCloseHandler}
      >
        <p className={styles.content}>{t('sentinel_policy.manual_unlock.modal_description_1')}</p>
        <p className={styles.content}>{t('sentinel_policy.manual_unlock.modal_description_2')}</p>
        <form className={styles.form}>
          <FormField
            isRequired
            title="security.sentinel_policy.manual_unlock.unblock_by_identifiers"
          >
            <Controller
              name="identifiers"
              control={control}
              rules={{
                validate: (value) => {
                  if (value.length === 0) {
                    return t('sentinel_policy.manual_unlock.empty_identifier_error');
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <MultiOptionInput
                  values={value}
                  placeholder={t('sentinel_policy.manual_unlock.placeholder')}
                  renderValue={(value) => value}
                  validateInput={(input) => {
                    if (value.includes(input)) {
                      return t('sentinel_policy.manual_unlock.duplicate_identifier_error');
                    }

                    return { value: input };
                  }}
                  error={errors.identifiers?.message}
                  onChange={onChange}
                  onError={(error) => {
                    setError('identifiers', { type: 'custom', message: error });
                  }}
                  onClearError={() => {
                    clearErrors('identifiers');
                  }}
                />
              )}
            />
          </FormField>
        </form>
      </ModalLayout>
    </Modal>
  );
}

export default SentinelUnlockModal;
