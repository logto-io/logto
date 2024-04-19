import { conditionalString } from '@silverhand/essentials';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import useCustomDomain from '@/hooks/use-custom-domain';

import { type SamlProviderConfig } from '../../types/saml';

type Props = {
  readonly samlProviderConfig?: SamlProviderConfig;
};

function SamlConnectorSpInfo({ samlProviderConfig }: Props) {
  const { applyDomain: applyCustomDomain } = useCustomDomain();

  /**
   * Should not fallback to some other manually concatenated URL, show empty string instead.
   * Empty string should never show up unless the API does not work properly.
   */
  return (
    <>
      <FormField title="enterprise_sso.basic_info.saml.acs_url_field_name">
        <CopyToClipboard
          displayType="block"
          variant="border"
          value={conditionalString(
            samlProviderConfig?.serviceProvider &&
              applyCustomDomain(samlProviderConfig.serviceProvider.assertionConsumerServiceUrl)
          )}
        />
      </FormField>
      <FormField title="enterprise_sso.basic_info.saml.audience_uri_field_name">
        <CopyToClipboard
          displayType="block"
          variant="border"
          value={conditionalString(
            samlProviderConfig?.serviceProvider &&
              applyCustomDomain(samlProviderConfig.serviceProvider.entityId)
          )}
        />
      </FormField>
    </>
  );
}

export default SamlConnectorSpInfo;
