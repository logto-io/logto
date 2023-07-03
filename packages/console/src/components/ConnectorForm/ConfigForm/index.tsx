import type { ConnectorConfigFormItem } from '@logto/connector-kit';
import { ConnectorType } from '@logto/connector-kit';
import { DomainStatus } from '@logto/schemas';
import { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';
import CodeEditor from '@/ds-components/CodeEditor';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import useCustomDomain from '@/hooks/use-custom-domain';
import type { ConnectorFormType } from '@/types/connector';
import { applyDomain } from '@/utils/domain';
import { jsonValidator } from '@/utils/validator';

import ConfigFormFields from './ConfigFormFields';
import * as styles from './index.module.scss';

type Props = {
  formItems?: ConnectorConfigFormItem[];
  className?: string;
  connectorId: string;
  connectorType?: ConnectorType;
};

function ConfigForm({ formItems, className, connectorId, connectorType }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    formState: { errors },
  } = useFormContext<ConnectorFormType>();
  const { userEndpoint } = useContext(AppEndpointsContext);
  const { data: customDomain } = useCustomDomain();
  const callbackUri = new URL(`/callback/${connectorId}`, userEndpoint).toString();

  return (
    <div className={className}>
      {connectorType === ConnectorType.Social && (
        <FormField
          title="connectors.guide.callback_uri"
          tip={t('connectors.guide.callback_uri_description')}
        >
          <CopyToClipboard
            className={styles.copyToClipboard}
            variant="border"
            value={
              customDomain?.status === DomainStatus.Active
                ? applyDomain(callbackUri, customDomain.domain)
                : callbackUri
            }
          />
          {customDomain?.status === DomainStatus.Active && userEndpoint && (
            <div className={styles.description}>
              <DynamicT
                forKey="domain.custom_social_callback_url_note"
                interpolation={{
                  custom: customDomain.domain,
                  default: new URL(userEndpoint).host,
                }}
              />
            </div>
          )}
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
