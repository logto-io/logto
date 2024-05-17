import { isLocalhost, isValidRegEx, validateUriOrigin } from '@logto/core-kit';
import {
  DomainStatus,
  type Application,
  type CustomDomain as CustomDomainType,
  type SnakeCaseOidcConfig,
} from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import classNames from 'classnames';
import { useState, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

import ExternalLinkIcon from '@/assets/icons/external-link.svg';
import DomainStatusTag from '@/components/DomainStatusTag';
import FormCard from '@/components/FormCard';
import OpenExternalLink from '@/components/OpenExternalLink';
import { isCloud } from '@/consts/env';
import { openIdProviderConfigPath } from '@/consts/oidc';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Spacer from '@/ds-components/Spacer';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useApi, { type RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import AddDomainForm from '@/pages/TenantSettings/TenantDomainSettings/AddDomainForm';
import CustomDomain from '@/pages/TenantSettings/TenantDomainSettings/CustomDomain';

import EndpointsAndCredentials from '../EndpointsAndCredentials';
import { type ApplicationForm } from '../utils';

import SessionForm from './components/SessionForm';
import * as styles from './index.module.scss';

type Props = {
  readonly data: Application;
};

const routes = Object.freeze(['/register', '/sign-in', '/sign-in-callback', '/sign-out']);

function ProtectedAppSettings({ data }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { data: oidcConfig } = useSWRImmutable<SnakeCaseOidcConfig, RequestError>(
    openIdProviderConfigPath
  );
  const {
    data: customDomains = [],
    isLoading: isLoadingCustomDomain,
    mutate,
  } = useSWR<CustomDomainType[]>(
    `api/applications/${data.id}/protected-app-metadata/custom-domains`
  );
  const { data: systemDomainData } = useSWRImmutable<ProtectedAppsDomainConfig>(
    isCloud && 'api/systems/application'
  );
  const api = useApi();
  const [isDeletingCustomDomain, setIsDeletingCustomDomain] = useState(false);

  const {
    control,
    register,
    getFieldState,
    setValue,
    formState: { errors },
  } = useFormContext<ApplicationForm>();

  const { fields } = useFieldArray({
    control,
    name: 'protectedAppMetadata.pageRules',
  });

  useEffect(() => {
    if (fields.length === 0) {
      setValue('protectedAppMetadata.pageRules', [{ path: '' }]);
    }
  }, [fields.length, setValue]);

  if (!data.protectedAppMetadata || !oidcConfig) {
    return null;
  }

  const { host } = data.protectedAppMetadata;
  // We only support one custom domain for protected apps at the moment.
  const customDomain = customDomains[0];
  const externalLink = `https://${
    customDomain?.status === DomainStatus.Active ? customDomain.domain : host
  }`;

  const showCustomDomainLoadingMask = isLoadingCustomDomain || isDeletingCustomDomain;

  return (
    <>
      <FormCard
        title="application_details.integration"
        description="application_details.integration_description"
        learnMoreLink={{
          href: getDocumentationUrl('/docs/references/applications'),
          targetBlank: 'noopener',
        }}
      >
        <div className={styles.launcher}>
          <span>{t('protected_app.success_message')}</span>
          <Button
            className={styles.button}
            size="small"
            title="application_details.try_it"
            trailingIcon={<ExternalLinkIcon />}
            onClick={() => {
              window.open(externalLink, '_blank');
            }}
          />
        </div>
        <FormField isRequired title="application_details.application_name">
          <TextInput
            {...register('name', { required: true })}
            error={Boolean(errors.name)}
            placeholder={t('application_details.application_name_placeholder')}
          />
        </FormField>
        <FormField
          isRequired
          title="protected_app.form.url_field_label"
          description={cond(
            getFieldState('protectedAppMetadata.origin').isDirty &&
              'protected_app.form.url_field_modification_notice'
          )}
          tip={t('protected_app.form.url_field_tooltip')}
        >
          <TextInput
            {...register('protectedAppMetadata.origin', {
              required: true,
              validate: (value) => {
                if (!validateUriOrigin(value)) {
                  return t('protected_app.form.errors.invalid_url');
                }

                if (isLocalhost(value)) {
                  return t('protected_app.form.errors.localhost');
                }

                return true;
              },
            })}
            error={
              errors.protectedAppMetadata?.origin?.message ===
              t('protected_app.form.errors.localhost') ? (
                <Trans
                  components={{
                    a: (
                      <TextLink to="https://docs.logto.io/docs/recipes/protected-app/#local-development" />
                    ),
                  }}
                >
                  {t('protected_app.form.errors.localhost')}
                </Trans>
              ) : (
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                errors.protectedAppMetadata?.origin?.message ||
                (errors.protectedAppMetadata?.origin?.type === 'required' &&
                  t('protected_app.form.errors.url_required'))
              )
            }
            placeholder={t('protected_app.form.url_field_placeholder')}
          />
        </FormField>
        {!!host && (
          <FormField title="protected_app.form.domain_field_label">
            {showCustomDomainLoadingMask && (
              <div className={styles.loadingSkeleton}>
                <div className={classNames(styles.bone, styles.title)} />
                <div className={classNames(styles.bone, styles.description)} />
              </div>
            )}
            {!customDomain && !showCustomDomainLoadingMask && (
              <AddDomainForm
                className={styles.customDomain}
                onSubmitCustomDomain={async (json) => {
                  await api.post(
                    `api/applications/${data.id}/protected-app-metadata/custom-domains`,
                    { json }
                  );
                  void mutate();
                }}
              />
            )}
            {customDomain && !showCustomDomainLoadingMask && (
              <CustomDomain
                hasOpenExternalLink
                className={styles.customDomain}
                customDomain={customDomain}
                onDeleteCustomDomain={async () => {
                  setIsDeletingCustomDomain(true);
                  await api.delete(
                    `api/applications/${data.id}/protected-app-metadata/custom-domains/${customDomain.domain}`
                  );
                  setIsDeletingCustomDomain(false);
                  void mutate();
                }}
              />
            )}
            {customDomain?.status !== DomainStatus.Active && (
              <>
                <div className={styles.label}>
                  {t('application_details.app_domain_description_1', {
                    domain: systemDomainData?.protectedApps.defaultDomain,
                  })}
                </div>
                <div className={styles.hostInUse}>
                  <span className={styles.host}>{host}</span>
                  <DomainStatusTag status={DomainStatus.Active} />
                  <Spacer />
                  <CopyToClipboard value={host} variant="icon" />
                  <OpenExternalLink link={externalLink} />
                </div>
              </>
            )}
            {customDomain?.status === DomainStatus.Active && (
              <span className={styles.label}>
                <Trans components={{ domain: <span className={styles.inlineCode} /> }}>
                  {t('application_details.app_domain_description_2', { domain: host })}
                </Trans>
              </span>
            )}
          </FormField>
        )}
        <FormField
          title="application_details.custom_rules"
          description="application_details.custom_rules_description"
          descriptionPosition="top"
          tip={
            <span className={styles.tip}>
              <Trans components={{ ol: <ol />, li: <li /> }}>
                {t('application_details.custom_rules_tip')}
              </Trans>
            </span>
          }
        >
          {fields.map((field, index) => (
            <TextInput
              key={field.id}
              {...register(`protectedAppMetadata.pageRules.${index}.path`, {
                validate: (value) => !value || isValidRegEx(value) || t('errors.invalid_regex'),
              })}
              error={Boolean(errors.protectedAppMetadata?.pageRules?.[index]?.path)}
              placeholder={t('application_details.custom_rules_placeholder')}
            />
          ))}
        </FormField>
      </FormCard>
      <FormCard
        title="application_details.service_configuration"
        description="application_details.service_configuration_description"
      >
        <FormField
          title="application_details.authentication_routes"
          description="application_details.authentication_routes_description"
          descriptionPosition="top"
        >
          <div className={styles.routes}>
            {routes.map((route) => (
              <CopyToClipboard key={route} variant="border" value={route} />
            ))}
          </div>
        </FormField>
        <FormField title="application_details.protect_origin_server">
          <InlineNotification severity="alert">
            <Trans
              components={{
                a: (
                  <TextLink
                    href={getDocumentationUrl(
                      '/docs/recipes/protected-app/#protect-your-origin-server'
                    )}
                    targetBlank="noopener"
                  />
                ),
              }}
            >
              {t('application_details.protect_origin_server_description')}
            </Trans>
          </InlineNotification>
        </FormField>
      </FormCard>
      <EndpointsAndCredentials app={data} oidcConfig={oidcConfig} />
      <SessionForm data={data} />
    </>
  );
}

export default ProtectedAppSettings;
