import { Theme, TenantTag } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import CreateTenantHeaderIconDark from '@/assets/icons/create-tenant-header-dark.svg?react';
import CreateTenantHeaderIcon from '@/assets/icons/create-tenant-header.svg?react';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse } from '@/cloud/types/router';
import Region, {
  defaultRegionName,
  getInstanceDropdownItems,
  logtoDropdownItem,
  checkPrivateRegionAccess,
} from '@/components/Region';
import { isDevFeaturesEnabled } from '@/consts/env';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import { Ring } from '@/ds-components/Spinner';
import TextInput from '@/ds-components/TextInput';
import useAvailableRegions from '@/hooks/use-available-regions';
import useTheme from '@/hooks/use-theme';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import EnvTagOptionContent from './EnvTagOptionContent';
import InstanceSelector from './InstanceSelector';
import SelectTenantPlanModal from './SelectTenantPlanModal';
import styles from './index.module.scss';
import { type CreateTenantData } from './types';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: (tenant?: TenantResponse) => void;
};

// eslint-disable-next-line complexity
function CreateTenantModal({ isOpen, onClose }: Props) {
  const [tenantData, setTenantData] = useState<CreateTenantData>();
  const theme = useTheme();
  const cloudApi = useCloudApi();
  const { regions, regionsError, getRegionById } = useAvailableRegions();

  const defaultValues = Object.freeze({
    tag: TenantTag.Development,
    instanceId: logtoDropdownItem.id,
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

  const [instanceId, regionName] = watch(['instanceId', 'regionName']);

  const setTenantTagInForm = useCallback(
    (tag: TenantTag) => {
      reset({ ...watch(), tag });
    },
    [reset, watch]
  );

  const instanceOptions = useMemo(() => getInstanceDropdownItems(regions ?? []), [regions]);
  const hasPrivateRegionsAccess = useMemo(() => checkPrivateRegionAccess(regions ?? []), [regions]);

  const publicRegions = useMemo(
    () => regions?.filter((region) => !region.isPrivate) ?? [],
    [regions]
  );

  const isLogtoInstance = instanceId === logtoDropdownItem.id;

  const currentRegion = useMemo(() => {
    if (isDevFeaturesEnabled) {
      return getRegionById(isLogtoInstance ? regionName : instanceId);
    }

    if (isLogtoInstance) {
      return getRegionById(regionName);
    }
    // For private instances, find the region that matches the instance
    return regions?.find((region) => region.id === instanceId);
  }, [isLogtoInstance, regionName, instanceId, getRegionById, regions]);

  const getFinalRegionName = useCallback(
    (instanceId: string, regionName: string) => {
      if (isDevFeaturesEnabled) {
        return isLogtoInstance ? regionName : instanceId;
      }
      return regionName;
    },
    [isLogtoInstance]
  );

  const createTenant = async ({ name, tag, instanceId, regionName }: CreateTenantData) => {
    // For Logto public instance, use the selected region
    // For private instances, use the instance ID as the region
    const finalRegionName = getFinalRegionName(instanceId, regionName);
    const newTenant = await cloudApi.post('/api/tenants', {
      body: { name, tag, regionName: finalRegionName },
    });
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

      // If it's a dev tag, we don't immediately create a tenant. Instead, we first save it to tenantData. After the user selects a plan, we then create the tenant. At this point, considering the current state of the interaction design, we should use getFinalRegionName() to obtain the final regionName and update it in tenantData.
      setTenantData({ ...data, regionName: getFinalRegionName(data.instanceId, data.regionName) });
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

          {!isDevFeaturesEnabled && (
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
          )}

          {/* Only show the instance selector (dropdown) if there are private regions available. */}
          {isDevFeaturesEnabled && hasPrivateRegionsAccess && (
            <FormField
              title="tenants.settings.tenant_instance"
              tip={t('tenants.settings.tenant_instance_description')}
            >
              {!regions && !regionsError && <Ring />}
              {regionsError && <span className={styles.error}>{regionsError.message}</span>}
              {regions && !regionsError && (
                <Controller
                  control={control}
                  name="instanceId"
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <InstanceSelector
                      instances={instanceOptions}
                      value={value}
                      isDisabled={isSubmitting}
                      setTenantTagInForm={setTenantTagInForm}
                      onChange={onChange}
                    />
                  )}
                />
              )}
            </FormField>
          )}
          {isDevFeaturesEnabled && isLogtoInstance && (
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
                    <RadioGroup type="small" name={name} value={value} onChange={onChange}>
                      {publicRegions.map((region) => (
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
          )}

          {currentRegion && (
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
                    {currentRegion.tags.map((tag) => (
                      <Radio key={tag} value={tag}>
                        {/* If the region is private (for enterprise customers), we hide the available production plan. */}
                        <EnvTagOptionContent
                          tag={tag}
                          isAvailableProductionPlanHidden={currentRegion.isPrivate}
                        />
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
              toast.success(t('tenants.create_modal.tenant_created'));
            }
          }}
        />
      </ModalLayout>
    </Modal>
  );
}

export default CreateTenantModal;
