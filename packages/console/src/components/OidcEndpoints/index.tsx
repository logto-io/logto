import { type SnakeCaseOidcConfig } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { useCallback, useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import CaretDown from '@/assets/icons/caret-down.svg?react';
import CaretUp from '@/assets/icons/caret-up.svg?react';
import DomainSelector from '@/components/DomainSelector';
import { isCloud } from '@/consts/env';
import { customDomainFeatureLink } from '@/consts/external-links';
import {
  openIdProviderConfigPath,
  openIdProviderJwksPath,
  openIdProviderPath,
} from '@/consts/oidc';
import { AppDataContext } from '@/contexts/AppDataProvider';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useDomainSelection from '@/hooks/use-domain-selection';
import { applyDomain } from '@/utils/url';

import styles from './index.module.scss';

type Props = {
  readonly oidcConfig: SnakeCaseOidcConfig;
  /** Third-party clients integrate with the OIDC endpoints only, the Logto endpoint means nothing to them. */
  readonly hasLogtoEndpoint?: boolean;
};

/** The tenant OIDC endpoints, shared by every client that connects to Logto as an OIDC provider. */
function OidcEndpoints({ oidcConfig, hasLogtoEndpoint = false }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const [showMoreEndpoints, setShowMoreEndpoints] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const [selectedDomain, setSelectedDomain] = useDomainSelection();

  const toggleShowMoreEndpoints = useCallback(() => {
    setShowMoreEndpoints((previous) => !previous);
  }, []);

  const ToggleVisibleCaretIcon = showMoreEndpoints ? CaretUp : CaretDown;

  return (
    <>
      {isCloud && (
        <DomainSelector
          value={selectedDomain}
          tip={(closeTipHandler) => (
            <Trans
              components={{
                a: (
                  <TextLink
                    targetBlank="noopener"
                    href={getDocumentationUrl(customDomainFeatureLink)}
                    onClick={closeTipHandler}
                  />
                ),
              }}
            >
              {t('domain.switch_custom_domain_tip')}
            </Trans>
          )}
          onChange={setSelectedDomain}
        />
      )}
      {tenantEndpoint && hasLogtoEndpoint && (
        <FormField title="application_details.logto_endpoint">
          <CopyToClipboard
            displayType="block"
            value={applyDomain(tenantEndpoint.href, selectedDomain)}
            variant="border"
          />
        </FormField>
      )}
      {tenantEndpoint && (
        <>
          <FormField title="application_details.issuer_endpoint">
            <CopyToClipboard
              displayType="block"
              value={applyDomain(
                appendPath(tenantEndpoint, openIdProviderPath).href,
                selectedDomain
              )}
              variant="border"
            />
          </FormField>
          <FormField title="application_details.jwks_uri">
            <CopyToClipboard
              displayType="block"
              value={applyDomain(
                appendPath(tenantEndpoint, openIdProviderJwksPath).href,
                selectedDomain
              )}
              variant="border"
            />
          </FormField>
        </>
      )}
      {showMoreEndpoints && (
        <>
          {tenantEndpoint && (
            <FormField title="application_details.config_endpoint">
              <CopyToClipboard
                displayType="block"
                value={applyDomain(
                  appendPath(tenantEndpoint, openIdProviderConfigPath).href,
                  selectedDomain
                )}
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
              value={applyDomain(oidcConfig.authorization_endpoint, selectedDomain)}
              variant="border"
            />
          </FormField>
          <FormField title="application_details.token_endpoint">
            <CopyToClipboard
              displayType="block"
              value={applyDomain(oidcConfig.token_endpoint, selectedDomain)}
              variant="border"
            />
          </FormField>
          <FormField title="application_details.user_info_endpoint">
            <CopyToClipboard
              displayType="block"
              value={applyDomain(oidcConfig.userinfo_endpoint, selectedDomain)}
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
    </>
  );
}

export default OidcEndpoints;
