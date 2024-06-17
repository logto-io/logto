import { type SignInExperience, type Organization, type SsoConnector } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { useState, useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import SsoIcon from '@/assets/icons/single-sign-on.svg';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import MultiOptionInput from '@/components/MultiOptionInput';
import OrganizationRolesSelect from '@/components/OrganizationRolesSelect';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { isDevFeaturesEnabled } from '@/consts/env';
import CodeEditor from '@/ds-components/CodeEditor';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import { type Option } from '@/ds-components/Select/MultiSelect';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import useApi, { type RequestError } from '@/hooks/use-api';
import { domainRegExp } from '@/pages/EnterpriseSsoDetails/Experience/DomainsInput/consts';
import { trySubmitSafe } from '@/utils/form';

import { type OrganizationDetailsOutletContext } from '../types';

import * as styles from './index.module.scss';

type FormData = Partial<Omit<Organization, 'customData'> & { customData: string }> & {
  isJitEnabled: boolean;
  jitEmailDomains: string[];
  jitRoles: Array<Option<string>>;
};

const isJsonObject = (value: string) => {
  const parsed = trySafe<unknown>(() => JSON.parse(value));
  return Boolean(parsed && typeof parsed === 'object');
};

const normalizeData = (
  data: Organization,
  jit: { emailDomains: string[]; roles: Array<Option<string>> }
): FormData => ({
  ...data,
  isJitEnabled: jit.emailDomains.length > 0 || jit.roles.length > 0,
  jitEmailDomains: jit.emailDomains,
  jitRoles: jit.roles,
  customData: JSON.stringify(data.customData, undefined, 2),
});

const assembleData = ({
  isJitEnabled,
  jitEmailDomains,
  customData,
  ...data
}: FormData): Partial<Organization> => ({
  ...data,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  customData: JSON.parse(customData ?? '{}'),
});

function Settings() {
  const { isDeleting, data, jit, onUpdated } = useOutletContext<OrganizationDetailsOutletContext>();
  const { data: signInExperience } = useSWR<SignInExperience, RequestError>('api/sign-in-exp');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    setError,
    clearErrors,
    watch,
  } = useForm<FormData>({
    defaultValues: normalizeData(data, {
      emailDomains: jit.emailDomains.map(({ emailDomain }) => emailDomain),
      roles: jit.roles.map(({ id, name }) => ({ value: id, title: name })),
    }),
  });
  const [isJitEnabled, isMfaRequired] = watch(['isJitEnabled', 'isMfaRequired']);
  const api = useApi();
  const [keyword, setKeyword] = useState('');
  // Fetch all SSO connector to show if a domain is configured SSO
  const { data: ssoConnectors } = useSWRInfinite<SsoConnector[]>(
    (index, previous) => {
      return previous && previous.length === 0 ? null : `api/sso-connectors?page=${index + 1}`;
    },
    { initialSize: Number.POSITIVE_INFINITY }
  );

  const hasSsoEnabled = useCallback(
    (domain: string) =>
      ssoConnectors?.some((connectors) =>
        connectors.some(({ domains }) => domains.includes(domain))
      ),
    [ssoConnectors]
  );

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const emailDomains = data.isJitEnabled ? data.jitEmailDomains : [];
      const roles = data.isJitEnabled ? data.jitRoles : [];
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
      ]);

      reset(normalizeData(updatedData, { emailDomains, roles }));
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
      </FormCard>
      {isDevFeaturesEnabled && (
        <FormCard
          title="organization_details.membership_policies"
          description="organization_details.membership_policies_description"
        >
          <FormField title="organization_details.jit.title">
            <div className={styles.jitContent}>
              <Switch
                label={t('organization_details.jit.description')}
                {...register('isJitEnabled')}
              />
            </div>
          </FormField>
          {isJitEnabled && (
            <FormField
              title="organization_details.jit.email_domains"
              description={
                <Trans
                  components={{
                    Icon: <SsoIcon className={styles.ssoEnabled} />,
                  }}
                >
                  {t('organization_details.jit.sso_email_domain_description')}
                </Trans>
              }
            >
              <Controller
                name="jitEmailDomains"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <MultiOptionInput
                    values={value}
                    renderValue={(value) =>
                      hasSsoEnabled(value) ? (
                        <>
                          <SsoIcon className={styles.ssoEnabled} />
                          {value}
                        </>
                      ) : (
                        value
                      )
                    }
                    validateInput={(input) => {
                      if (!domainRegExp.test(input)) {
                        return t('organization_details.jit.invalid_domain');
                      }

                      if (value.includes(input)) {
                        return t('organization_details.jit.domain_already_added');
                      }

                      return { value: input };
                    }}
                    placeholder={t('organization_details.jit.email_domains_placeholder')}
                    error={errors.jitEmailDomains?.message}
                    onChange={onChange}
                    onError={(error) => {
                      setError('jitEmailDomains', { type: 'custom', message: error });
                    }}
                    onClearError={() => {
                      clearErrors('jitEmailDomains');
                    }}
                  />
                )}
              />
            </FormField>
          )}
          {isJitEnabled && (
            <FormField
              title="organization_details.jit.organization_roles"
              description="organization_details.jit.organization_roles_description"
              descriptionPosition="top"
            >
              <Controller
                name="jitRoles"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <OrganizationRolesSelect
                    keyword={keyword}
                    setKeyword={setKeyword}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
          )}
          <FormField title="organization_details.mfa.title" tip={t('organization_details.mfa.tip')}>
            <Switch
              label={t('organization_details.mfa.description')}
              {...register('isMfaRequired')}
            />
            {isMfaRequired && signInExperience?.mfa.factors.length === 0 && (
              <InlineNotification severity="alert" className={styles.warning}>
                {t('organization_details.mfa.no_mfa_warning')}
              </InlineNotification>
            )}
          </FormField>
        </FormCard>
      )}
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleting && isDirty} />
    </DetailsForm>
  );
}

export default Settings;
