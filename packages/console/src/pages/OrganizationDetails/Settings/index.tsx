import { type SignInExperience, type Organization } from '@logto/schemas';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import CodeEditor from '@/ds-components/CodeEditor';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useApi, { type RequestError } from '@/hooks/use-api';
import { mfa } from '@/hooks/use-console-routes/routes/mfa';
import { trySubmitSafe } from '@/utils/form';

import { type OrganizationDetailsOutletContext } from '../types';

import JitSettings from './JitSettings';
import * as styles from './index.module.scss';
import { assembleData, isJsonObject, normalizeData, type FormData } from './utils';

function Settings() {
  const { isDeleting, data, jit, onUpdated } = useOutletContext<OrganizationDetailsOutletContext>();
  const { data: signInExperience } = useSWR<SignInExperience, RequestError>('api/sign-in-exp');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const form = useForm<FormData>({
    defaultValues: normalizeData(data, {
      emailDomains: jit.emailDomains.map(({ emailDomain }) => emailDomain),
      roles: jit.roles.map(({ id, name }) => ({ value: id, title: name })),
      ssoConnectorIds: jit.ssoConnectorIds,
    }),
  });
  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    watch,
  } = form;
  const [isMfaRequired] = watch(['isMfaRequired']);
  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const emailDomains = data.jitEmailDomains;
      const roles = data.jitRoles;
      const ssoConnectorIds = data.jitSsoConnectorIds;
      const updatedData = await api
        .patch(`api/organizations/${data.id}`, {
          json: assembleData(data),
        })
        .json<Organization>();

      await Promise.all([
        api.put(`api/organizations/${data.id}/jit/email-domains`, {
          json: { emailDomains },
        }),
        api.put(`api/organizations/${data.id}/jit/roles`, {
          json: { organizationRoleIds: roles.map(({ value }) => value) },
        }),
        api.put(`api/organizations/${data.id}/jit/sso-connectors`, {
          json: { ssoConnectorIds },
        }),
      ]);

      reset(normalizeData(updatedData, { emailDomains, roles, ssoConnectorIds }));
      toast.success(t('general.saved'));
      onUpdated(updatedData);
    })
  );

  return (
    <DetailsForm
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={reset}
      onSubmit={onSubmit}
    >
      <FormCard
        title="general.settings_nav"
        description="organization_details.settings_description"
      >
        <FormField isRequired title="general.name">
          <TextInput
            placeholder={t('organization_details.name_placeholder')}
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
        <FormField title="general.description">
          <TextInput
            placeholder={t('organization_details.description_placeholder')}
            {...register('description')}
          />
        </FormField>
        <FormField
          title="organization_details.custom_data"
          tip={t('organization_details.custom_data_tip')}
        >
          <Controller
            name="customData"
            control={control}
            rules={{
              validate: (value) =>
                isJsonObject(value ?? '') ? true : t('organization_details.invalid_json_object'),
            }}
            render={({ field }) => (
              <CodeEditor language="json" {...field} error={errors.customData?.message} />
            )}
          />
        </FormField>
        <FormField title="organization_details.mfa.title" tip={t('organization_details.mfa.tip')}>
          <Switch
            label={t('organization_details.mfa.description')}
            {...register('isMfaRequired')}
          />
          {isMfaRequired && signInExperience?.mfa.factors.length === 0 && (
            <InlineNotification severity="alert" className={styles.mfaWarning}>
              <Trans
                i18nKey="admin_console.organization_details.mfa.no_mfa_warning"
                components={{
                  a: <TextLink to={'/' + mfa.path} />,
                }}
              />
            </InlineNotification>
          )}
        </FormField>
      </FormCard>
      <JitSettings form={form} />
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleting && isDirty} />
    </DetailsForm>
  );
}

export default Settings;
