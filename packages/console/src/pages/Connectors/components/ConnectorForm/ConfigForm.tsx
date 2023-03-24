import type { ConnectorConfigFormItem } from '@logto/connector-kit';
import { ConnectorType } from '@logto/connector-kit';
import { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CodeEditor from '@/components/CodeEditor';
import CopyToClipboard from '@/components/CopyToClipboard';
import FormField from '@/components/FormField';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';
import { jsonValidator } from '@/utils/validator';

import type { ConnectorFormType } from '../../types';
import ConfigFormItems from '../ConfigForm';

import * as styles from './ConfigForm.module.scss';

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

  return (
    <div className={className}>
      {connectorType === ConnectorType.Social && (
        <FormField title="connectors.guide.callback_uri">
          <CopyToClipboard
            className={styles.copyToClipboard}
            variant="border"
            value={new URL(`/callback/${connectorId}`, userEndpoint).toString()}
          />
          <div className={styles.description}>{t('connectors.guide.callback_uri_description')}</div>
        </FormField>
      )}
      {formItems ? (
        <ConfigFormItems formItems={formItems} />
      ) : (
        <FormField title="connectors.guide.config">
          <Controller
            name="config"
            control={control}
            rules={{
              validate: (value) => jsonValidator(value) || t('errors.invalid_json_format'),
            }}
            render={({ field: { onChange, value } }) => (
              <CodeEditor
                hasError={Boolean(errors.config)}
                errorMessage={errors.config?.message}
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
