import {
  type SamlApplicationResponse,
  type Application,
  type SamlApplicationConfig,
  type SamlAcsUrl,
  BindingType,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

/**
 * According to the design, a SAML app will be associated with multiple records from various tables.
 * Therefore, when complete SAML app data is required, it is necessary to retrieve multiple related records and assemble them into a comprehensive SAML app dataset. This dataset includes:
 * - A record from the `applications` table with a `type` of `SAML`
 * - A record from the `saml_application_configs` table
 */
export const ensembleSamlApplication = ({
  application,
  samlConfig,
}: {
  application: Application;
  samlConfig: Pick<SamlApplicationConfig, 'attributeMapping' | 'entityId' | 'acsUrl'>;
}): SamlApplicationResponse => {
  return {
    ...application,
    ...samlConfig,
  };
};

/**
 * Only HTTP-POST binding is supported for receiving SAML assertions at the moment.
 */
export const validateAcsUrl = (acsUrl: SamlAcsUrl) => {
  assertThat(
    acsUrl.binding === BindingType.POST,
    new RequestError({
      code: 'application.saml.acs_url_binding_not_supported',
      status: 422,
    })
  );
};
