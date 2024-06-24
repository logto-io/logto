import {
  ApplicationType,
  DomainStatus,
  type Application,
  type SnakeCaseOidcConfig,
} from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { useCallback, useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import CaretDown from '@/assets/icons/caret-down.svg';
import CaretUp from '@/assets/icons/caret-up.svg';
import FormCard from '@/components/FormCard';
import { openIdProviderConfigPath, openIdProviderPath } from '@/consts/oidc';
import { AppDataContext } from '@/contexts/AppDataProvider';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';
import useCustomDomain from '@/hooks/use-custom-domain';

import * as styles from './index.module.scss';

type Props = {
  readonly app: Application;
  readonly oidcConfig: SnakeCaseOidcConfig;
};

function EndpointsAndCredentials({ app: { type, secret, id, isThirdParty }, oidcConfig }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const [showMoreEndpoints, setShowMoreEndpoints] = useState(false);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data: customDomain, applyDomain: applyCustomDomain } = useCustomDomain();

  const toggleShowMoreEndpoints = useCallback(() => {
    setShowMoreEndpoints((previous) => !previous);
  }, []);

  const ToggleVisibleCaretIcon = showMoreEndpoints ? CaretUp : CaretDown;

  return (
    <FormCard
      title="application_details.endpoints_and_credentials"
      description="application_details.endpoints_and_credentials_description"
      learnMoreLink={{
        href: 'https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint',
        targetBlank: true,
      }}
    >
      {/* Hide logto endpoint field in third-party application's form. */}
      {tenantEndpoint && !isThirdParty && (
        <FormField title="application_details.logto_endpoint">
          <CopyToClipboard
            displayType="block"
            value={applyCustomDomain(tenantEndpoint.href)}
            variant="border"
          />
        </FormField>
      )}
      {tenantEndpoint && (
        <FormField title="application_details.issuer_endpoint">
          <CopyToClipboard
            displayType="block"
            value={applyCustomDomain(appendPath(tenantEndpoint, openIdProviderPath).href)}
            variant="border"
          />
        </FormField>
      )}
      {showMoreEndpoints && (
        <>
          {tenantEndpoint && (
            <FormField title="application_details.config_endpoint">
              <CopyToClipboard
                displayType="block"
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
                      targetBlank
                      href="https://openid.net/specs/openid-connect-core-1_0.html#Authentication"
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
              displayType="block"
              value={applyCustomDomain(oidcConfig.authorization_endpoint)}
              variant="border"
            />
          </FormField>
          <FormField title="application_details.token_endpoint">
            <CopyToClipboard
              displayType="block"
              value={applyCustomDomain(oidcConfig.token_endpoint)}
              variant="border"
            />
          </FormField>
          <FormField title="application_details.user_info_endpoint">
            <CopyToClipboard
              displayType="block"
              value={applyCustomDomain(oidcConfig.userinfo_endpoint)}
              variant="border"
            />
          </FormField>
        </>
      )}
      <div className={styles.fieldButton}>
        <Button
          size="small"
          type="text"
          title={
            showMoreEndpoints
              ? 'application_details.hide_endpoint_details'
              : 'application_details.show_endpoint_details'
          }
          trailingIcon={<ToggleVisibleCaretIcon className={styles.trailingIcon} />}
          onClick={toggleShowMoreEndpoints}
        />
      </div>

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
      <FormField title="application_details.application_id">
        <CopyToClipboard displayType="block" value={id} variant="border" />
      </FormField>
      {[
        ApplicationType.Traditional,
        ApplicationType.MachineToMachine,
        ApplicationType.Protected,
      ].includes(type) && (
        <FormField title="application_details.application_secret">
          <CopyToClipboard
            hasVisibilityToggle
            displayType="block"
            value={secret}
            variant="border"
          />
        </FormField>
      )}
    </FormCard>
  );
}

export default EndpointsAndCredentials;
