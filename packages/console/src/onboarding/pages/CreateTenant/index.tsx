import { emailRegEx } from '@logto/core-kit';
import { useLogto } from '@logto/react';
import { TenantRole, Theme } from '@logto/schemas';
import { useCallback, useContext } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import CreateTenantHeaderIconDark from '@/assets/icons/create-tenant-header-dark.svg?react';
import CreateTenantHeaderIcon from '@/assets/icons/create-tenant-header.svg?react';
import { createTenantApi, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import ActionBar from '@/components/ActionBar';
import { GtagConversionId, reportConversion } from '@/components/Conversion/utils';
import { type CreateTenantData } from '@/components/CreateTenantModal/types';
import PageMeta from '@/components/PageMeta';
import Region, { defaultRegionName } from '@/components/Region';
import { availableRegions } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import useCurrentUser from '@/hooks/use-current-user';
import useTheme from '@/hooks/use-theme';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import pageLayout from '@/onboarding/scss/layout.module.scss';
import InviteEmailsInput from '@/pages/TenantSettings/TenantMembers/InviteEmailsInput';
import { type InviteeEmailItem } from '@/pages/TenantSettings/TenantMembers/types';
import { trySubmitSafe } from '@/utils/form';

type CreateTenantForm = Omit<CreateTenantData, 'tag'> & { collaboratorEmails: InviteeEmailItem[] };

function CreateTenant() {
  const methods = useForm<CreateTenantForm>({
    defaultValues: { name: 'My project', regionName: defaultRegionName, collaboratorEmails: [] },
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
  } = methods;
  const { prependTenant } = useContext(TenantsContext);
  const theme = useTheme();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { update } = useUserOnboardingData();
  const parseEmailOptions = useCallback(
    (values: InviteeEmailItem[]) => {
      const validEmails = values.filter(({ value }) => emailRegEx.test(value));

      return {
        values: validEmails,
        errorMessage:
          values.length === validEmails.length
            ? undefined
            : t('tenant_members.errors.invalid_email'),
      };
    },
    [t]
  );

  const { isAuthenticated, getOrganizationToken } = useLogto();
  const cloudApi = useCloudApi();
  const { user } = useCurrentUser();

  const onCreateClick = handleSubmit(
    trySubmitSafe(async ({ name, regionName, collaboratorEmails }: CreateTenantForm) => {
      reportConversion({
        gtagId: GtagConversionId.SignUp,
        redditType: 'SignUp',
        transactionId: user?.id,
      });
      const newTenant = await cloudApi.post('/api/tenants', {
        body: { name: name || 'My project', regionName },
      });
      prependTenant(newTenant);
      toast.success(t('tenants.create_modal.tenant_created'));

      const tenantCloudApi = createTenantApi({
        hideErrorToast: true,
        isAuthenticated,
        getOrganizationToken,
        tenantId: newTenant.id,
      });

      if (collaboratorEmails.length > 0) {
        // Should not block the onboarding flow if the invitation fails.
        try {
          await tenantCloudApi.post('/api/tenants/:tenantId/invitations', {
            params: { tenantId: newTenant.id },
            body: {
              invitee: collaboratorEmails.map(({ value }) => value),
              roleName: TenantRole.Collaborator,
            },
          });
          toast.success(t('tenant_members.messages.invitation_sent'));
        } catch {
          toast.error(t('tenants.create_modal.invitation_failed', { duration: 5 }));
        }
      }
      await update({ isOnboardingDone: true });
    })
  );

  return (
    <div className={pageLayout.page}>
      <PageMeta titleKey={['cloud.create_tenant.page_title', 'cloud.general.onboarding']} />
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={pageLayout.content}>
          {theme === Theme.Light ? <CreateTenantHeaderIcon /> : <CreateTenantHeaderIconDark />}
          <div className={pageLayout.title}>{t('cloud.create_tenant.title')}</div>
          <div className={pageLayout.description}>{t('cloud.create_tenant.description')}</div>
          <FormProvider {...methods}>
            <FormField title="tenants.settings.tenant_name">
              <TextInput
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                placeholder="My project"
                disabled={isSubmitting}
                {...register('name')}
                error={Boolean(errors.name)}
              />
            </FormField>
            <FormField
              title="tenants.settings.tenant_region"
              tip={t('tenants.settings.tenant_region_description')}
            >
              <Controller
                control={control}
                name="regionName"
                rules={{ required: true }}
                render={({ field: { onChange, value, name } }) => (
                  <RadioGroup type="small" name={name} value={value} onChange={onChange}>
                    {availableRegions.map((region) => (
                      <Radio
                        key={region}
                        title={
                          <DangerousRaw>
                            <Region regionName={region} />
                          </DangerousRaw>
                        }
                        value={region}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
            </FormField>
            <FormField title="cloud.create_tenant.invite_collaborators">
              <Controller
                name="collaboratorEmails"
                control={control}
                rules={{
                  validate: (value): string | true => {
                    return parseEmailOptions(value).errorMessage ?? true;
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <InviteEmailsInput
                    formName="collaboratorEmails"
                    values={value}
                    error={errors.collaboratorEmails?.message}
                    placeholder={t('tenant_members.invite_modal.email_input_placeholder')}
                    parseEmailOptions={parseEmailOptions}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
          </FormProvider>
        </div>
      </OverlayScrollbar>
      <ActionBar>
        <Button
          title="general.create"
          type="primary"
          disabled={isSubmitting}
          onClick={onCreateClick}
        />
      </ActionBar>
    </div>
  );
}

export default CreateTenant;
