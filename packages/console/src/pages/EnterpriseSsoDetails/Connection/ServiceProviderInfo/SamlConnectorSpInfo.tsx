import { conditionalString } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';

import DomainSelector from '@/components/DomainSelector';
import { isCloud } from '@/consts/env';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import useDomainSelection from '@/hooks/use-domain-selection';
import { applyDomain } from '@/utils/url';

import { type SamlProviderConfig } from '../../types/saml';

import styles from './ConnectorSpInfo.module.scss';

type Props = {
  readonly samlProviderConfig?: SamlProviderConfig;
};

function SamlConnectorSpInfo({ samlProviderConfig }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [selectedDomain, setSelectedDomain] = useDomainSelection();
  /**
   * Should not fallback to some other manually concatenated URL, show empty string instead.
   * Empty string should never show up unless the API does not work properly.
   */
  return (
    <>
      {isCloud && (
        <DomainSelector
          tip={t('domain.switch_saml_connector_domain_tip')}
          value={selectedDomain}
          onChange={setSelectedDomain}
        />
      )}
      <FormField title="enterprise_sso.basic_info.saml.acs_url_field_name">
        <div className={styles.uriContent}>
          <CopyToClipboard
            displayType="block"
            variant="border"
            value={conditionalString(
              samlProviderConfig?.serviceProvider &&
                applyDomain(
                  samlProviderConfig.serviceProvider.assertionConsumerServiceUrl,
                  selectedDomain
                )
            )}
          />
        </div>
      </FormField>
      <FormField title="enterprise_sso.basic_info.saml.audience_uri_field_name">
        <CopyToClipboard
          displayType="block"
          variant="border"
          value={conditionalString(
            samlProviderConfig?.serviceProvider &&
              applyDomain(samlProviderConfig.serviceProvider.entityId, selectedDomain)
          )}
        />
      </FormField>
    </>
  );
}

export default SamlConnectorSpInfo;
