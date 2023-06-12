import { type Application, type SnakeCaseOidcConfig, ApplicationType } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import CopyToClipboard from '@/components/CopyToClipboard';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import Switch from '@/components/Switch';
import TextInput from '@/components/TextInput';
import TextLink from '@/components/TextLink';
import { openIdProviderConfigPath } from '@/consts/oidc';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';

import * as styles from '../index.module.scss';

type Props = {
  applicationType: ApplicationType;
  oidcConfig: SnakeCaseOidcConfig;
};

function AdvancedSettings({ applicationType, oidcConfig }: Props) {
  const { userEndpoint } = useContext(AppEndpointsContext);
  const {
    register,
    formState: { errors },
  } = useFormContext<Application & { isAdmin?: boolean }>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <FormCard
      title="application_details.advanced_settings"
      description="application_details.advanced_settings_description"
      learnMoreLink="https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint"
    >
      {userEndpoint && (
        <FormField title="application_details.config_endpoint">
          <CopyToClipboard
            className={styles.textField}
            value={appendPath(userEndpoint, openIdProviderConfigPath).href}
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
          value={oidcConfig.authorization_endpoint}
          variant="border"
        />
      </FormField>
      <FormField title="application_details.token_endpoint">
        <CopyToClipboard
          className={styles.textField}
          value={oidcConfig.token_endpoint}
          variant="border"
        />
      </FormField>
      <FormField title="application_details.user_info_endpoint">
        <CopyToClipboard
          className={styles.textField}
          value={oidcConfig.userinfo_endpoint}
          variant="border"
        />
      </FormField>
      {[ApplicationType.Traditional, ApplicationType.SPA].includes(applicationType) && (
        <FormField title="application_details.always_issue_refresh_token">
          <Switch
            label={t('application_details.always_issue_refresh_token_label')}
            {...register('customClientMetadata.alwaysIssueRefreshToken')}
          />
        </FormField>
      )}
      {[ApplicationType.Traditional, ApplicationType.Native].includes(applicationType) && (
        <>
          <FormField title="application_details.rotate_refresh_token">
            <Switch
              label={t('application_details.rotate_refresh_token_label')}
              {...register('customClientMetadata.rotateRefreshToken')}
            />
          </FormField>
          <FormField
            title="application_details.refresh_token_ttl"
            tip={t('application_details.refresh_token_ttl_tip')}
          >
            <TextInput
              {...register('customClientMetadata.refreshTokenTtlInDays', {
                min: 1,
                max: 90,
                valueAsNumber: true,
              })}
              placeholder="14"
              // Confirm if we need a customized message here
              error={errors.customClientMetadata?.refreshTokenTtlInDays?.message}
            />
          </FormField>
        </>
      )}
      {applicationType === ApplicationType.MachineToMachine && (
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
