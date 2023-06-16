import type { AdminConsoleKey } from '@logto/phrases';
import { Theme } from '@logto/schemas';
import { TenantTag, type TenantInfo } from '@logto/schemas/models';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import CreateTenantHeaderIconDark from '@/assets/icons/create-tenant-header-dark.svg';
import CreateTenantHeaderIcon from '@/assets/icons/create-tenant-header.svg';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import useTheme from '@/hooks/use-theme';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onClose: (tenant?: TenantInfo) => void;
};

const tagOptions: Array<{ title: AdminConsoleKey; value: TenantTag }> = [
  {
    title: 'tenants.create_modal.environment_tag_development',
    value: TenantTag.Development,
  },
  {
    title: 'tenants.create_modal.environment_tag_staging',
    value: TenantTag.Staging,
  },
  {
    title: 'tenants.create_modal.environment_tag_production',
    value: TenantTag.Production,
  },
];

function CreateTenantModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const methods = useForm<Pick<TenantInfo, 'name' | 'tag'>>({
    defaultValues: { tag: TenantTag.Development },
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
  } = methods;

  const cloudApi = useCloudApi();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { name, tag } = data;
      const newTenant = await cloudApi.post('/api/tenants', { body: { name, tag } });

      onClose(newTenant);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  });

  return (
    <Modal
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="tenants.create_modal.title"
        subtitle="tenants.create_modal.subtitle"
        headerIcon={
          theme === Theme.Light ? <CreateTenantHeaderIcon /> : <CreateTenantHeaderIconDark />
        }
        footer={
          <Button
            disabled={isSubmitting}
            htmlType="submit"
            title="tenants.create_modal.create_button"
            size="large"
            type="primary"
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        <FormProvider {...methods}>
          <FormField isRequired title="tenants.create_modal.tenant_name">
            <TextInput {...register('name', { required: true })} error={Boolean(errors.name)} />
          </FormField>
          <FormField title="tenants.create_modal.environment_tag">
            <Controller
              control={control}
              name="tag"
              rules={{ required: true }}
              render={({ field: { onChange, value, name } }) => (
                <RadioGroup type="small" value={value} name={name} onChange={onChange}>
                  {tagOptions.map(({ value: optionValue, title }) => (
                    <Radio key={optionValue} title={title} value={optionValue} />
                  ))}
                </RadioGroup>
              )}
            />
            <div className={styles.description}>
              {t('tenants.create_modal.environment_tag_description')}
            </div>
          </FormField>
        </FormProvider>
      </ModalLayout>
    </Modal>
  );
}

export default CreateTenantModal;
