import { type Region as RegionType } from '@logto/cloud/routes';
import { Theme, TenantTag } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWRImmutable from 'swr/immutable';

import CreateTenantHeaderIconDark from '@/assets/icons/create-tenant-header-dark.svg?react';
import CreateTenantHeaderIcon from '@/assets/icons/create-tenant-header.svg?react';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse } from '@/cloud/types/router';
import Region, { defaultRegionName } from '@/components/Region';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import { Ring } from '@/ds-components/Spinner';
import TextInput from '@/ds-components/TextInput';
import useTheme from '@/hooks/use-theme';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import EnvTagOptionContent from './EnvTagOptionContent';
import SelectTenantPlanModal from './SelectTenantPlanModal';
import styles from './index.module.scss';
import { type CreateTenantData } from './types';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: (tenant?: TenantResponse) => void;
};

const allTags = Object.freeze([TenantTag.Development, TenantTag.Production]);

function CreateTenantModal({ isOpen, onClose }: Props) {
  const [tenantData, setTenantData] = useState<CreateTenantData>();
  const theme = useTheme();
  const cloudApi = useCloudApi();
  const { data: regions, error: regionsError } = useSWRImmutable<RegionType[], Error>(
    'api/me/regions',
    async () => {
      const { regions } = await cloudApi.get('/api/me/regions');
      return regions;
    }
  );

  const defaultValues = Object.freeze({
    tag: TenantTag.Development,
    regionName: defaultRegionName,
  });
  const methods = useForm<CreateTenantData>({
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
    watch,
  } = methods;

  const currentRegion = watch('regionName');
  // The following tag filtering will be replaced with dynamic tag fetching soon.
  // Use it as a temporary solution.
  const availableTags = useMemo(
    () => (currentRegion.includes('_DEV_') ? [TenantTag.Development] : allTags),
    [currentRegion]
  );

  const createTenant = async ({ name, tag, regionName }: CreateTenantData) => {
    const newTenant = await cloudApi.post('/api/tenants', { body: { name, tag, regionName } });
    onClose(newTenant);
  };
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const onCreateClick = handleSubmit(
    trySubmitSafe(async (data: CreateTenantData) => {
      const { tag } = data;
      if (tag === TenantTag.Development) {
        await createTenant(data);
        toast.success(t('tenants.create_modal.tenant_created'));
        return;
      }

      setTenantData(data);
    })
  );

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
        subtitle="tenants.create_modal.subtitle"
        headerIcon={
          theme === Theme.Light ? <CreateTenantHeaderIcon /> : <CreateTenantHeaderIconDark />
        }
        footer={
          <Button
            isLoading={isSubmitting}
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
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            title="tenants.settings.tenant_region"
            tip={t('tenants.settings.tenant_region_description')}
          >
            {!regions && !regionsError && <Ring />}
            {regionsError && <span className={styles.error}>{regionsError.message}</span>}
            {regions && !regionsError && (
              <Controller
                control={control}
                name="regionName"
                rules={{ required: true }}
                render={({ field: { onChange, value, name } }) => (
                  <RadioGroup type="plain" name={name} value={value} onChange={onChange}>
                    {regions.map((region) => (
                      <Radio
                        key={region.id}
                        title={
                          <DangerousRaw>
                            <Region region={region} />
                          </DangerousRaw>
                        }
                        value={region.id}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
            )}
          </FormField>
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
              toast.success(t('tenants.create_modal.tenant_created'));
            }
          }}
        />
      </ModalLayout>
    </Modal>
  );
}

export default CreateTenantModal;
