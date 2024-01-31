import { isValidRegEx, validateUriOrigin } from '@logto/core-kit';
import {
  DomainStatus,
  type Application,
  type CustomDomain as CustomDomainType,
} from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import classNames from 'classnames';
import { type ChangeEvent, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ExternalLinkIcon from '@/assets/icons/external-link.svg';
import DomainStatusTag from '@/components/DomainStatusTag';
import FormCard from '@/components/FormCard';
import OpenExternalLink from '@/components/OpenExternalLink';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Spacer from '@/ds-components/Spacer';
import TextInput from '@/ds-components/TextInput';
import NumericInput from '@/ds-components/TextInput/NumericInput';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import AddDomainForm from '@/pages/TenantSettings/TenantDomainSettings/AddDomainForm';
import CustomDomain from '@/pages/TenantSettings/TenantDomainSettings/CustomDomain';

import { type ApplicationForm } from '../utils';

import * as styles from './index.module.scss';

type Props = {
  data: Application;
};

const routes = Object.freeze(['/register', '/sign-in', '/sign-in-callback', '/sign-out']);
const maxSessionDuration = 365; // 1 year

function ProtectedAppSettings({ data }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const {
    data: customDomains = [],
    isLoading: isLoadingCustomDomain,
    mutate,
  } = useSWR<CustomDomainType[]>(
    `api/applications/${data.id}/protected-app-metadata/custom-domains`
  );
  const api = useApi();
  const [isDeletingCustomDomain, setIsDeletingCustomDomain] = useState(false);

  const {
    control,
    register,
    getFieldState,
    formState: { errors },
  } = useFormContext<ApplicationForm>();

  const { fields } = useFieldArray({
    control,
    name: 'protectedAppMetadata.pageRules',
  });

  if (!data.protectedAppMetadata) {
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
          tip={<span className={styles.tip}>{t('application_details.origin_url_tip')}</span>}
        >
          <TextInput
            {...register('protectedAppMetadata.origin', {
              required: true,
              validate: (value) =>
                validateUriOrigin(value) || t('protected_app.form.errors.invalid_url'),
            })}
            error={
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              errors.protectedAppMetadata?.origin?.message ||
              (errors.protectedAppMetadata?.origin?.type === 'required' &&
                t('protected_app.form.errors.url_required'))
            }
            placeholder={t('protected_app.form.url_field_placeholder')}
          />
        </FormField>
        {!!host && (
          <FormField title="domain.custom.custom_domain_field">
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
                  {t('application_details.app_domain_description_1')}
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
        <FormField title="application_details.implement_jwt_verification">
          <InlineNotification severity="alert">
            <Trans
              components={{
                a: (
                  <TextLink
                    // TODO: @charles please update the doc link
                    href={getDocumentationUrl(
                      '/docs/recipes/protect-your-api/#validate-the-api-requests-authorization-token'
                    )}
                    targetBlank="noopener"
                  />
                ),
              }}
            >
              {t('application_details.implement_jwt_verification_description')}
            </Trans>
          </InlineNotification>
        </FormField>
      </FormCard>
      <FormCard title="application_details.session">
        <FormField title="application_details.session_duration">
          <Controller
            name="protectedAppMetadata.sessionDuration"
            control={control}
            rules={{
              min: 1,
            }}
            render={({ field: { onChange, value, name } }) => (
              <NumericInput
                className={styles.sessionDuration}
                name={name}
                placeholder="14"
                value={String(value)}
                min={1}
                max={maxSessionDuration}
                error={Boolean(errors.protectedAppMetadata?.sessionDuration)}
                onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                  onChange(value && Number(value));
                }}
                onValueUp={() => {
                  onChange(value + 1);
                }}
                onValueDown={() => {
                  onChange(value - 1);
                }}
                onBlur={() => {
                  if (value < 1) {
                    onChange(1);
                  } else if (value > maxSessionDuration) {
                    onChange(maxSessionDuration);
                  }
                }}
              />
            )}
          />
        </FormField>
      </FormCard>
    </>
  );
}

export default ProtectedAppSettings;
