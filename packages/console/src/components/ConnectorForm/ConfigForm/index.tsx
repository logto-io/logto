import type { ConnectorConfigFormItem } from '@logto/connector-kit';
import { ConnectorType } from '@logto/connector-kit';
import { appendPath, conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import { isCloud } from '@/consts/env';
import { customDomainFeatureLink } from '@/consts/external-links';
import { AppDataContext } from '@/contexts/AppDataProvider';
import CodeEditor from '@/ds-components/CodeEditor';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';
import useAvailableDomains from '@/hooks/use-available-domains';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import type { ConnectorFormType } from '@/types/connector';
import { applyDomain } from '@/utils/url';
import { jsonValidator } from '@/utils/validator';

import ConfigFormFields from './ConfigFormFields';
import styles from './index.module.scss';

type Props = {
  readonly formItems?: ConnectorConfigFormItem[];
  readonly className?: string;
  readonly connectorId: string;
  readonly connectorFactoryId?: string;
  readonly connectorType?: ConnectorType;
};

function ConfigForm({
  formItems,
  className,
  connectorId,
  connectorFactoryId,
  connectorType,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    formState: { errors },
  } = useFormContext<ConnectorFormType>();
  const { tenantEndpoint } = useContext(AppDataContext);
  const availableDomains = useAvailableDomains();
  const callbackUri = new URL(`/callback/${connectorId}`, tenantEndpoint).toString();
  const acsUrl = conditional(
    tenantEndpoint && appendPath(tenantEndpoint, `/api/authn/saml/${connectorId}`).href
  );
  const isSamlConnector = connectorFactoryId === 'saml';
  // This is an auto-generated URL serve as the connector's internal property and should be configured on the identity provider side.
  const displayUrl = isSamlConnector ? acsUrl : callbackUri;
  const { getDocumentationUrl } = useDocumentationUrl();

  return (
    <div className={className}>
      {connectorType === ConnectorType.Social && displayUrl && (
        <FormField
          title={isSamlConnector ? 'connectors.guide.acs_url' : 'connectors.guide.callback_uri'}
          tip={conditional(
            !isSamlConnector &&
              ((closeTipHandler) => (
                <>
                  <p>{t('connectors.guide.callback_uri_description')}</p>
                  {isCloud && (
                    <p>
                      <Trans
                        components={{
                          a: (
                            <TextLink
                              href={getDocumentationUrl(customDomainFeatureLink)}
                              targetBlank="noopener"
                              onClick={closeTipHandler}
                            />
                          ),
                        }}
                      >
                        {t('connectors.guide.callback_uri_custom_domain_description')}
                      </Trans>
                    </p>
                  )}
                </>
              ))
          )}
        >
          <div className={styles.callbackUriContent}>
            {availableDomains.map((domain) => (
              <CopyToClipboard
                key={domain}
                displayType="block"
                variant="border"
                value={applyDomain(displayUrl, domain)}
              />
            ))}
          </div>
        </FormField>
      )}
      {formItems ? (
        <ConfigFormFields formItems={formItems} />
      ) : (
        <FormField title="connectors.guide.config">
          <Controller
            name="jsonConfig"
            control={control}
            rules={{
              validate: (value) => jsonValidator(value) || t('errors.invalid_json_format'),
            }}
            render={({ field: { onChange, value } }) => (
              <CodeEditor
                error={errors.jsonConfig?.message ?? Boolean(errors.jsonConfig)}
                language="json"
                value={value}
                onChange={onChange}
              />
            )}
          />
        </FormField>
      )}
    </div>
  );
}

export default ConfigForm;
