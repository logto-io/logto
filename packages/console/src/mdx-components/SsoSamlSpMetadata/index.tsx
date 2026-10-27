import { conditionalString } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import DomainSelector from '@/components/DomainSelector';
import { isCloud } from '@/consts/env';
import { SsoConnectorContext } from '@/contexts/SsoConnectorContextProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import useDomainSelection from '@/hooks/use-domain-selection';
import { applyDomain } from '@/utils/url';

import styles from './index.module.scss';

// Basic SAML SP config metadata, @see `packages/core/sso/src/types/saml`
const samlServiceProviderMetadataGuard = z.object({
  entityId: z.string().min(1),
  assertionConsumerServiceUrl: z.string().min(1),
});

// SAML provider config, @see `packages/core/sso/src/SamlSsoConnector`
const samlProviderConfigGuard = z.object({
  serviceProvider: samlServiceProviderMetadataGuard,
});

type ServiceProviderMetadata = z.infer<typeof samlServiceProviderMetadataGuard>;

const parseServiceProviderMetadata = (providerConfig: unknown) => {
  const result = samlProviderConfigGuard.safeParse(providerConfig);

  return result.success ? result.data.serviceProvider : undefined;
};

type FieldsProps = {
  readonly serviceProviderMetadata?: ServiceProviderMetadata;
  readonly selectedDomain?: string;
};

function SpMetadataFields({ serviceProviderMetadata, selectedDomain }: FieldsProps) {
  return (
    <>
      <FormField
        title="enterprise_sso.basic_info.saml.audience_uri_field_name"
        className={styles.inputField}
      >
        <CopyToClipboard
          displayType="block"
          variant="border"
          value={conditionalString(
            serviceProviderMetadata?.entityId &&
              applyDomain(serviceProviderMetadata.entityId, selectedDomain)
          )}
        />
      </FormField>
      <FormField
        title="enterprise_sso.basic_info.saml.acs_url_field_name"
        className={styles.inputField}
      >
        <CopyToClipboard
          displayType="block"
          variant="border"
          value={conditionalString(
            serviceProviderMetadata?.assertionConsumerServiceUrl &&
              applyDomain(serviceProviderMetadata.assertionConsumerServiceUrl, selectedDomain)
          )}
        />
      </FormField>
    </>
  );
}

function TenantSsoSamlSpMetadata({ providerConfig }: { readonly providerConfig: unknown }) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [selectedDomain, setSelectedDomain] = useDomainSelection();

  const serviceProviderMetadata = useMemo(
    () => parseServiceProviderMetadata(providerConfig),
    [providerConfig]
  );

  return (
    <div>
      {isCloud && (
        <DomainSelector
          value={selectedDomain}
          className={styles.domainSelector}
          tip={t('domain.switch_saml_connector_domain_tip')}
          onChange={setSelectedDomain}
        />
      )}
      <SpMetadataFields
        serviceProviderMetadata={serviceProviderMetadata}
        selectedDomain={selectedDomain}
      />
    </div>
  );
}

/** Console SSO connectors use the fixed service provider endpoints provided by Logto Cloud. */
function ConsoleSsoSamlSpMetadata({ providerConfig }: { readonly providerConfig: unknown }) {
  const serviceProviderMetadata = useMemo(
    () => parseServiceProviderMetadata(providerConfig),
    [providerConfig]
  );

  return (
    <div>
      <SpMetadataFields serviceProviderMetadata={serviceProviderMetadata} />
    </div>
  );
}

function SsoSamlSpMetadata() {
  const { ssoConnector, consoleSsoConnector } = useContext(SsoConnectorContext);

  if (consoleSsoConnector) {
    return <ConsoleSsoSamlSpMetadata providerConfig={consoleSsoConnector.providerConfig} />;
  }

  if (!ssoConnector) {
    return null;
  }

  return <TenantSsoSamlSpMetadata providerConfig={ssoConnector.providerConfig} />;
}

export default SsoSamlSpMetadata;
