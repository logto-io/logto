import {
  type Application,
  ApplicationType,
  customClientMetadataGuard,
  DomainStatus,
  type SnakeCaseOidcConfig,
} from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import { isDevFeaturesEnabled } from '@/consts/env';
import { openIdProviderConfigPath } from '@/consts/oidc';
import { AppDataContext } from '@/contexts/AppDataProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useCustomDomain from '@/hooks/use-custom-domain';

import * as styles from '../index.module.scss';

type Props = {
  app: Application;
  oidcConfig: SnakeCaseOidcConfig;
};

function AdvancedSettings({ app: { type }, oidcConfig }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const {
    register,
    formState: { errors },
  } = useFormContext<Application & { isAdmin?: boolean }>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { minValue, maxValue } =
    customClientMetadataGuard.shape.refreshTokenTtlInDays._def.innerType;
  const minTtl = minValue ?? Number.NEGATIVE_INFINITY;
  const maxTtl = maxValue ?? Number.POSITIVE_INFINITY;
  const ttlErrorMessage = t('errors.number_should_be_between_inclusive', {
    min: minTtl,
    max: maxTtl,
  });
  const { data: customDomain, applyDomain: applyCustomDomain } = useCustomDomain();

  return (
    <FormCard
      title="application_details.advanced_settings"
      description="application_details.advanced_settings_description"
      learnMoreLink="https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint"
    >
      {tenantEndpoint && (
        <FormField title="application_details.config_endpoint">
          <CopyToClipboard
            className={styles.textField}
            value={applyCustomDomain(appendPath(tenantEndpoint, openIdProviderConfigPath).href)}
            variant="border"
          />
        </FormField>
      )}
      <FormField
        title="application_details.authorization_endpoint"
        tip={(closeTipHandler) => (
          <Trans
            components={{
              a: (
                <TextLink
                  href="https://openid.net/specs/openid-connect-core-1_0.html#Authentication"
                  target="_blank"
                  onClick={closeTipHandler}
                />
              ),
            }}
          >
            {t('application_details.authorization_endpoint_tip')}
          </Trans>
        )}
      >
        <CopyToClipboard
          className={styles.textField}
          value={applyCustomDomain(oidcConfig.authorization_endpoint)}
          variant="border"
        />
      </FormField>
      <FormField title="application_details.token_endpoint">
        <CopyToClipboard
          className={styles.textField}
          value={applyCustomDomain(oidcConfig.token_endpoint)}
          variant="border"
        />
      </FormField>
      <FormField title="application_details.user_info_endpoint">
        <CopyToClipboard
          className={styles.textField}
          value={applyCustomDomain(oidcConfig.userinfo_endpoint)}
          variant="border"
        />
      </FormField>
      {customDomain?.status === DomainStatus.Active && tenantEndpoint && (
        <div className={styles.customEndpointNotes}>
          <DynamicT
            forKey="domain.custom_endpoint_note"
            interpolation={{
              custom: customDomain.domain,
              default: new URL(tenantEndpoint).host,
            }}
          />
        </div>
      )}
      {[ApplicationType.Traditional, ApplicationType.SPA].includes(type) && (
        <FormField title="application_details.always_issue_refresh_token">
          <Switch
            label={t('application_details.always_issue_refresh_token_label')}
            {...register('customClientMetadata.alwaysIssueRefreshToken')}
          />
        </FormField>
      )}
      {type !== ApplicationType.MachineToMachine && (
        <>
          <FormField title="application_details.rotate_refresh_token">
            <Switch
              label={
                <Trans
                  components={{
                    a: (
                      <TextLink
                        href="https://docs.logto.io/docs/references/applications/#rotate-refresh-token"
                        target="_blank"
                      />
                    ),
                  }}
                >
                  {t('application_details.rotate_refresh_token_label')}
                </Trans>
              }
              {...register('customClientMetadata.rotateRefreshToken')}
            />
          </FormField>
          <FormField
            title="application_details.refresh_token_ttl"
            tip={t('application_details.refresh_token_ttl_tip')}
          >
            <TextInput
              {...register('customClientMetadata.refreshTokenTtlInDays', {
                min: {
                  value: minTtl,
                  message: ttlErrorMessage,
                },
                max: {
                  value: maxTtl,
                  message: ttlErrorMessage,
                },
                valueAsNumber: true,
                validate: (value) =>
                  value === undefined ||
                  Number.isInteger(value) ||
                  t('errors.should_be_an_integer'),
              })}
              placeholder="14"
              // Confirm if we need a customized message here
              error={errors.customClientMetadata?.refreshTokenTtlInDays?.message}
            />
          </FormField>
        </>
      )}
      {!isDevFeaturesEnabled && type === ApplicationType.MachineToMachine && (
        <FormField title="application_details.enable_admin_access">
          <Switch
            label={t('application_details.enable_admin_access_label')}
            {...register('isAdmin')}
          />
        </FormField>
      )}
    </FormCard>
  );
}

export default AdvancedSettings;
