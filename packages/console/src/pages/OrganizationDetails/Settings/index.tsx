import {
  type SignInExperience,
  type Organization,
  type SsoConnectorWithProviderConfig,
  RoleType,
} from '@logto/schemas';
import { useState, useCallback, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import Minus from '@/assets/icons/minus.svg';
import Plus from '@/assets/icons/plus.svg';
import SsoIcon from '@/assets/icons/single-sign-on.svg';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import MultiOptionInput from '@/components/MultiOptionInput';
import OrganizationRolesSelect from '@/components/OrganizationRolesSelect';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { isDevFeaturesEnabled } from '@/consts/env';
import ActionMenu from '@/ds-components/ActionMenu';
import CodeEditor from '@/ds-components/CodeEditor';
import { DropdownItem } from '@/ds-components/Dropdown';
import FormField from '@/ds-components/FormField';
import IconButton from '@/ds-components/IconButton';
import InlineNotification from '@/ds-components/InlineNotification';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import useApi, { type RequestError } from '@/hooks/use-api';
import SsoConnectorLogo from '@/pages/EnterpriseSso/SsoConnectorLogo';
import { domainRegExp } from '@/pages/EnterpriseSsoDetails/Experience/DomainsInput/consts';
import { trySubmitSafe } from '@/utils/form';

import { type OrganizationDetailsOutletContext } from '../types';

import * as styles from './index.module.scss';
import { assembleData, isJsonObject, normalizeData, type FormData } from './utils';

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
      ssoConnectorIds: jit.ssoConnectorIds,
    }),
  });
  const [isMfaRequired, emailDomains] = watch(['isMfaRequired', 'jitEmailDomains']);
  const api = useApi();
  const [keyword, setKeyword] = useState('');
  // Fetch all SSO connector to show if a domain is configured SSO
  const { data: ssoConnectorMatrix } = useSWRInfinite<SsoConnectorWithProviderConfig[]>(
    (index, previous) => {
      return previous && previous.length === 0 ? null : `api/sso-connectors?page=${index + 1}`;
    },
    { initialSize: Number.POSITIVE_INFINITY }
  );
  const allSsoConnectors = useMemo(() => ssoConnectorMatrix?.flat(), [ssoConnectorMatrix]);
  const hasSsoEnabled = useCallback(
    (domain: string) => allSsoConnectors?.some(({ domains }) => domains.includes(domain)),
    [allSsoConnectors]
  );
  /** If any of the email domains has SSO enabled. */
  const hasSsoEnabledEmailDomain = useMemo(
    () => emailDomains.some((domain) => hasSsoEnabled(domain)),
    [emailDomains, hasSsoEnabled]
  );

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
            <InlineNotification severity="alert" className={styles.warning}>
              {t('organization_details.mfa.no_mfa_warning')}
            </InlineNotification>
          )}
        </FormField>
      </FormCard>
      {isDevFeaturesEnabled && (
        <FormCard
          title="organization_details.jit.title"
          description="organization_details.jit.description"
        >
          <FormField
            title="organization_details.jit.enterprise_sso"
            description="organization_details.jit.enterprise_sso_description"
            descriptionPosition="top"
          >
            <Controller
              name="jitSsoConnectorIds"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className={styles.ssoConnectorList}>
                  {value.map((id) => {
                    const connector = allSsoConnectors?.find(
                      ({ id: connectorId }) => id === connectorId
                    );
                    return (
                      connector && (
                        <div key={connector.id} className={styles.ssoConnector}>
                          <div className={styles.info}>
                            <SsoConnectorLogo className={styles.icon} data={connector} />
                            <span>
                              {connector.connectorName} - {connector.providerName}
                            </span>
                          </div>
                          <IconButton
                            onClick={() => {
                              onChange(value.filter((value) => value !== id));
                            }}
                          >
                            <Minus />
                          </IconButton>
                        </div>
                      )
                    );
                  })}
                  <ActionMenu
                    buttonProps={{
                      type: 'default',
                      size: 'medium',
                      title: 'organization_details.jit.add_enterprise_connector',
                      icon: <Plus />,
                      className: styles.addSsoConnectorButton,
                    }}
                    dropdownHorizontalAlign="start"
                  >
                    {allSsoConnectors
                      ?.filter(({ id }) => !value.includes(id))
                      .map((connector) => (
                        <DropdownItem
                          key={connector.id}
                          className={styles.dropdownItem}
                          onClick={() => {
                            onChange([...value, connector.id]);
                          }}
                        >
                          <SsoConnectorLogo className={styles.icon} data={connector} />
                          <span>{connector.connectorName}</span>
                        </DropdownItem>
                      ))}
                  </ActionMenu>
                </div>
              )}
            />
          </FormField>
          <FormField
            title="organization_details.jit.email_domain"
            description="organization_details.jit.email_domain_description"
            descriptionPosition="top"
            className={styles.jitEmailDomains}
          >
            <Controller
              name="jitEmailDomains"
              control={control}
              render={({ field: { onChange, value } }) => (
                <MultiOptionInput
                  values={value}
                  valueClassName={(domain) =>
                    hasSsoEnabled(domain) ? styles.ssoEnabled : undefined
                  }
                  renderValue={(value) =>
                    hasSsoEnabled(value) ? (
                      <>
                        <SsoIcon />
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
                  placeholder={t('organization_details.jit.email_domain_placeholder')}
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
            {hasSsoEnabledEmailDomain && (
              <InlineNotification severity="alert" className={styles.warning}>
                {t('organization_details.jit.sso_enabled_domain_warning')}
              </InlineNotification>
            )}
          </FormField>
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
                  roleType={RoleType.User}
                  keyword={keyword}
                  setKeyword={setKeyword}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </FormField>
        </FormCard>
      )}
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleting && isDirty} />
    </DetailsForm>
  );

  // eslint-disable-next-line max-lines -- Should be ok once dev features flag is removed
}

export default Settings;
