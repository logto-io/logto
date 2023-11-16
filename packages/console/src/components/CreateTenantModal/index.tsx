import type { AdminConsoleKey } from '@logto/phrases';
import { Theme, TenantTag } from '@logto/schemas';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import CreateTenantHeaderIconDark from '@/assets/icons/create-tenant-header-dark.svg';
import CreateTenantHeaderIcon from '@/assets/icons/create-tenant-header.svg';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse } from '@/cloud/types/router';
import { isDevFeaturesEnabled } from '@/consts/env';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import useTheme from '@/hooks/use-theme';
import * as modalStyles from '@/scss/modal.module.scss';

import EnvTagOptionContent from './EnvTagOptionContent';
import SelectTenantPlanModal from './SelectTenantPlanModal';
import * as styles from './index.module.scss';
import { type CreateTenantData } from './type';

type Props = {
  isOpen: boolean;
  onClose: (tenant?: TenantResponse) => void;
  // Todo @xiaoyijun delete this prop when dev tenant feature is ready
  // eslint-disable-next-line react/boolean-prop-naming
  skipPlanSelection?: boolean;
};

// Todo @xiaoyijun remove when dev tenant feature is ready
const tagOptions: Array<{ title: AdminConsoleKey; value: TenantTag }> = [
  {
    title: 'tenants.settings.environment_tag_development',
    value: TenantTag.Development,
  },
  {
    title: 'tenants.settings.environment_tag_staging',
    value: TenantTag.Staging,
  },
  {
    title: 'tenants.settings.environment_tag_production',
    value: TenantTag.Production,
  },
];

const availableTags = [TenantTag.Development, TenantTag.Production];

function CreateTenantModal({ isOpen, onClose, skipPlanSelection = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [tenantData, setTenantData] = useState<CreateTenantData>();
  const theme = useTheme();

  const defaultValues = { tag: TenantTag.Development };
  const methods = useForm<CreateTenantData>({
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
  } = methods;

  const cloudApi = useCloudApi();

  const createTenant = async (data: CreateTenantData) => {
    const { name, tag } = data;
    const newTenant = await cloudApi.post('/api/tenants', { body: { name, tag } });
    onClose(newTenant);
  };

  const onCreateClick = handleSubmit(async (data: CreateTenantData) => {
    /**
     * Todo @xiaoyijun remove the original logic when dev tenant feature is ready
     */
    if (!isDevFeaturesEnabled) {
      /**
       * Note: create tenant directly if it's from landing page,
       * since we want the user to get into the console as soon as possible
       */
      if (skipPlanSelection) {
        await createTenant(data);
        return;
      }

      setTenantData(data);
      return;
    }

    const { tag } = data;
    if (tag === TenantTag.Development) {
      await createTenant(data);
      return;
    }

    setTenantData(data);
  });

  return (
    <Modal
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onAfterClose={() => {
        reset(defaultValues);
      }}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="tenants.create_modal.title"
        subtitle={
          isDevFeaturesEnabled
            ? 'tenants.create_modal.subtitle'
            : 'tenants.create_modal.subtitle_deprecated'
        }
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
            onClick={onCreateClick}
          />
        }
        size="large"
        onClose={onClose}
      >
        <FormProvider {...methods}>
          <FormField isRequired title="tenants.settings.tenant_name">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              {...register('name', { required: true })}
              error={Boolean(errors.name)}
            />
          </FormField>
          {isDevFeaturesEnabled && (
            <FormField title="tenants.settings.tenant_region">
              <RadioGroup type="small" value="eu" name="region">
                <Radio
                  title={
                    <DangerousRaw>
                      <span className={styles.regionOptions}>🇪🇺 EU</span>
                    </DangerousRaw>
                  }
                  value="eu"
                />
                <Radio
                  isDisabled
                  title={
                    <DangerousRaw>
                      <span className={styles.regionOptions}>
                        🇺🇸 US
                        <span className={styles.comingSoon}>{`(${t('general.coming_soon')})`}</span>
                      </span>
                    </DangerousRaw>
                  }
                  value="us"
                />
              </RadioGroup>
            </FormField>
          )}
          {!isDevFeaturesEnabled && (
            <FormField title="tenants.settings.environment_tag">
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
                {t('tenants.settings.environment_tag_description')}
              </div>
            </FormField>
          )}
          {isDevFeaturesEnabled && (
            <FormField title="tenants.create_modal.tenant_usage_purpose">
              <Controller
                control={control}
                name="tag"
                rules={{ required: true }}
                render={({ field: { onChange, value, name } }) => (
                  <RadioGroup
                    type="card"
                    className={styles.envTagRadioGroup}
                    value={value}
                    name={name}
                    onChange={onChange}
                  >
                    {availableTags.map((tag) => (
                      <Radio key={tag} value={tag}>
                        <EnvTagOptionContent tag={tag} />
                      </Radio>
                    ))}
                  </RadioGroup>
                )}
              />
            </FormField>
          )}
        </FormProvider>
        <SelectTenantPlanModal
          tenantData={tenantData}
          onClose={(tenant) => {
            setTenantData(undefined);
            if (tenant) {
              /**
               * Note: only close the create tenant modal when tenant is created successfully
               */
              onClose(tenant);
            }
          }}
        />
      </ModalLayout>
    </Modal>
  );
}

export default CreateTenantModal;
