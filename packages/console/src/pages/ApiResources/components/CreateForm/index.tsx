import { isValidUrl } from '@logto/core-kit';
import { type Resource } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import Footer from './Footer';

type FormData = {
  name: string;
  indicator: string;
};

type Props = {
  onClose?: (createdApiResource?: Resource) => void;
};

function CreateForm({ onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm<FormData>();

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const createdApiResource = await api.post('api/resources', { json: data }).json<Resource>();
      toast.success(t('api_resources.api_resource_created', { name: createdApiResource.name }));
      onClose?.(createdApiResource);
    })
  );

  return (
    <Modal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose?.();
      }}
    >
      <ModalLayout
        title="api_resources.create"
        subtitle="api_resources.subtitle"
        footer={<Footer isCreationLoading={isSubmitting} onClickCreate={onSubmit} />}
        onClose={onClose}
      >
        <form>
          <FormField isRequired title="api_resources.api_name">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              {...register('name', { required: true })}
              placeholder={t('api_resources.api_name_placeholder')}
            />
          </FormField>
          <FormField
            isRequired
            title="api_resources.api_identifier"
            tip={(closeTipHandler) => (
              <Trans
                components={{
                  a: (
                    <TextLink
                      targetBlank
                      href="https://datatracker.ietf.org/doc/html/rfc8707#section-2"
                      onClick={closeTipHandler}
                    />
                  ),
                }}
              >
                {t('api_resources.api_identifier_tip')}
              </Trans>
            )}
          >
            <TextInput
              {...register('indicator', {
                required: true,
                validate: (value) =>
                  isValidUrl(value) || t('api_resources.invalid_resource_indicator_format'),
              })}
              placeholder={t('api_resources.api_identifier_placeholder')}
              error={errors.indicator?.message}
            />
          </FormField>
        </form>
      </ModalLayout>
    </Modal>
  );
}

export default CreateForm;
