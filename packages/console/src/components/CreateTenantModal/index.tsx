import { Theme, TenantTag } from '@logto/schemas';
import { condArray } from '@silverhand/essentials';
import { useCallback, useMemo, useState } from 'react';
import { Controller, type ControllerRenderProps, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import CreateTenantHeaderIconDark from '@/assets/icons/create-tenant-header-dark.svg?react';
import CreateTenantHeaderIcon from '@/assets/icons/create-tenant-header.svg?react';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse, type RegionResponse as RegionType } from '@/cloud/types/router';
import Region, {
  defaultRegionName,
  publicInstancesDropdownItem,
  type InstanceDropdownItemProps,
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

const checkPrivateRegionAccess = (regions: RegionType[]): boolean => {
  return regions.some(({ isPrivate }) => isPrivate);
};

const getInstanceDropdownItems = (regions: RegionType[]): InstanceDropdownItemProps[] => {
  const hasPublicRegions = regions.some(({ isPrivate }) => !isPrivate);
  const privateInstances = regions
    .filter(({ isPrivate }) => isPrivate)
    .map(({ id, name, country, tags, displayName }) => ({ id, name, country, tags, displayName }));

  return condArray(hasPublicRegions && publicInstancesDropdownItem, ...privateInstances);
};

const defaultFormValues = Object.freeze({
  tag: TenantTag.Development,
  instanceId: publicInstancesDropdownItem.name,
  regionName: defaultRegionName,
});

function CreateTenantModal({ isOpen, onClose }: Props) {
  const [tenantData, setTenantData] = useState<CreateTenantData>();
  const theme = useTheme();
  const cloudApi = useCloudApi();
  const { regions, regionsError, getRegionByName } = useAvailableRegions();

  const methods = useForm<CreateTenantData>({
    defaultValues: defaultFormValues,
  });

  const {
    reset,
    setValue,
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

  const instanceDropdownItems = useMemo(() => getInstanceDropdownItems(regions ?? []), [regions]);
  const hasPrivateRegionsAccess = useMemo(() => checkPrivateRegionAccess(regions ?? []), [regions]);

  const publicRegions = useMemo(
    () => regions?.filter((region) => !region.isPrivate) ?? [],
    [regions]
  );

  const isPublicInstanceSelected = useMemo(
    () => instanceId === publicInstancesDropdownItem.name,
    [instanceId]
  );

  const currentRegion = useMemo(() => getRegionByName(regionName), [regionName, getRegionByName]);

  const createTenant = async ({ name, tag, regionName }: CreateTenantData) => {
    const newTenant = await cloudApi.post('/api/tenants', {
      body: { name, tag, regionName },
    });
    onClose(newTenant);
  };
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const onCreateClick = handleSubmit(
    trySubmitSafe(async (data: CreateTenantData) => {
      const { tag, instanceId } = data;
      if (tag === TenantTag.Development) {
        await createTenant(data);
        toast.success(t('tenants.create_modal.tenant_created'));
        return;
      }

      // TODO: remove the dev feature guard once the enterprise subscription is ready
      // Private region production tenant creation
      if (isDevFeaturesEnabled && instanceId !== publicInstancesDropdownItem.name) {
        // Directly call the create tenant API instead of going through the plan selection modal.
        // Based on product design, private region can only have one production tenant plan,
        // and should not go through the subscription checkout flow,
        // always associated the new tenant with the existing enterprise subscription of the private region.
        await createTenant(data);
        toast.success(t('tenants.create_modal.tenant_created'));
        return;
      }

      // For production tenants, store creation parameters with the correct regionName for later use after plan selection.
      setTenantData(data);
    })
  );

  const handleInstanceIdChange = useCallback(
    (
      nextId: string,
      onChange: ControllerRenderProps<CreateTenantData, 'instanceId'>['onChange']
    ) => {
      onChange(nextId);

      if (nextId === publicInstancesDropdownItem.name && publicRegions[0]) {
        // Otherwise, reset to the first public region when switching to public instance.
        setValue('regionName', publicRegions[0].name, { shouldValidate: true, shouldDirty: true });
      } else {
        // If switching to a private instance, reset regionName using the instanceId.
        setValue('regionName', nextId, { shouldValidate: true, shouldDirty: true });
      }
    },
    [publicRegions, setValue]
  );

  return (
    <Modal
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onAfterClose={() => {
        reset(defaultFormValues);
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

          {/* Only show the instance selector (dropdown) if there are private regions available. */}
          {hasPrivateRegionsAccess && (
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
                      instances={instanceDropdownItems}
                      value={value}
                      isDisabled={isSubmitting}
                      setTenantTagInForm={setTenantTagInForm}
                      onChange={(nextId) => {
                        handleInstanceIdChange(nextId, onChange);
                      }}
                    />
                  )}
                />
              )}
            </FormField>
          )}
          {isPublicInstanceSelected && (
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
                          key={region.name}
                          title={
                            <DangerousRaw>
                              <Region region={region} />
                            </DangerousRaw>
                          }
                          value={region.name}
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
                        <EnvTagOptionContent tag={tag} isPrivateRegion={currentRegion.isPrivate} />
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
