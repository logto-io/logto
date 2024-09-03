import { RoleType, type SsoConnectorWithProviderConfig } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import useSWRInfinite from 'swr/infinite';

import Minus from '@/assets/icons/minus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import SsoIcon from '@/assets/icons/single-sign-on.svg?react';
import FormCard from '@/components/FormCard';
import MultiOptionInput from '@/components/MultiOptionInput';
import OrganizationRolesSelect from '@/components/OrganizationRolesSelect';
import { organizationJit } from '@/consts';
import ActionMenu from '@/ds-components/ActionMenu';
import { DropdownItem } from '@/ds-components/Dropdown';
import FormField from '@/ds-components/FormField';
import IconButton from '@/ds-components/IconButton';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import { enterpriseSso } from '@/hooks/use-console-routes/routes/enterprise-sso';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import SsoConnectorLogo from '@/pages/EnterpriseSso/SsoConnectorLogo';
import { domainRegExp } from '@/pages/EnterpriseSsoDetails/Experience/DomainsInput/consts';

import styles from './index.module.scss';
import { type FormData } from './utils';

type Props = {
  readonly form: UseFormReturn<FormData>;
};

function JitSettings({ form }: Props) {
  const {
    control,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = form;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [emailDomains, ssoConnectorIds] = watch(['jitEmailDomains', 'jitSsoConnectorIds']);
  const [keyword, setKeyword] = useState('');
  // Fetch all SSO connector to show if a domain is configured SSO
  const { data: ssoConnectorMatrix } = useSWRInfinite<SsoConnectorWithProviderConfig[]>(
    (index, previous) => {
      return previous && previous.length === 0 ? null : `api/sso-connectors?page=${index + 1}`;
    },
    { initialSize: Number.POSITIVE_INFINITY }
  );
  const allSsoConnectors = useMemo(() => ssoConnectorMatrix?.flat(), [ssoConnectorMatrix]);
  const filteredSsoConnectors = useMemo(
    () => allSsoConnectors?.filter(({ id }) => !ssoConnectorIds.includes(id)),
    [allSsoConnectors, ssoConnectorIds]
  );
  const hasSsoEnabled = useCallback(
    (domain: string) => allSsoConnectors?.some(({ domains }) => domains.includes(domain)),
    [allSsoConnectors]
  );
  /** If any of the email domains has SSO enabled. */
  const hasSsoEnabledEmailDomain = useMemo(
    () => emailDomains.some((domain) => hasSsoEnabled(domain)),
    [emailDomains, hasSsoEnabled]
  );
  const { getDocumentationUrl } = useDocumentationUrl();

  return (
    <FormCard
      title="organization_details.jit.title"
      description="organization_details.jit.description"
    >
      <FormField
        title="organization_details.jit.enterprise_sso"
        description={
          <Trans
            i18nKey="admin_console.organization_details.jit.enterprise_sso_description"
            components={{
              a: (
                <TextLink
                  to={getDocumentationUrl(organizationJit.enterpriseSso)}
                  targetBlank="noopener"
                />
              ),
            }}
          />
        }
        descriptionPosition="top"
      >
        {!allSsoConnectors?.length && (
          <InlineNotification className={styles.ssoJitContent}>
            <Trans
              i18nKey="admin_console.organization_details.jit.no_enterprise_connector_set"
              components={{ a: <TextLink to={'/' + enterpriseSso.path} /> }}
            />
          </InlineNotification>
        )}
        <Controller
          name="jitSsoConnectorIds"
          control={control}
          render={({ field: { onChange, value } }) => (
            <>
              {value.length > 0 && (
                <div className={classNames(styles.ssoJitContent, styles.ssoConnectorList)}>
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
                </div>
              )}
              {Boolean(filteredSsoConnectors?.length) && (
                <ActionMenu
                  buttonProps={{
                    className: styles.ssoJitContent,
                    type: 'default',
                    size: 'medium',
                    title: 'organization_details.jit.add_enterprise_connector',
                    icon: <Plus />,
                  }}
                  dropdownHorizontalAlign="start"
                >
                  {filteredSsoConnectors?.map((connector) => (
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
              )}
            </>
          )}
        />
      </FormField>
      <FormField
        title="organization_details.jit.email_domain"
        description={
          <Trans
            i18nKey="admin_console.organization_details.jit.email_domain_description"
            components={{
              a: (
                <TextLink
                  to={getDocumentationUrl(organizationJit.emailDomain)}
                  targetBlank="noopener"
                />
              ),
            }}
          />
        }
        descriptionPosition="top"
        className={styles.jitEmailDomains}
      >
        <Controller
          name="jitEmailDomains"
          control={control}
          render={({ field: { onChange, value } }) => (
            <MultiOptionInput
              values={value}
              valueClassName={(domain) => (hasSsoEnabled(domain) ? styles.ssoEnabled : undefined)}
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
          <InlineNotification severity="alert">
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
  );
}

export default JitSettings;
