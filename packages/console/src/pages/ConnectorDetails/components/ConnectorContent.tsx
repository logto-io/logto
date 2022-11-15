import type { Connector, ConnectorResponse, ConnectorMetadata } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import CodeEditor from '@/components/CodeEditor';
import FormField from '@/components/FormField';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import * as detailsStyles from '@/scss/details.module.scss';
import { safeParseJson } from '@/utilities/json';

import * as styles from '../index.module.scss';
import SenderTester from './SenderTester';

type Props = {
  isDeleted: boolean;
  connectorData: ConnectorResponse;
  onConnectorUpdated: (connector: ConnectorResponse) => void;
};

const ConnectorContent = ({ isDeleted, connectorData, onConnectorUpdated }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const methods = useForm<{ configJson: string }>({ reValidateMode: 'onBlur' });
  const {
    control,
    formState: { isSubmitting, isDirty },
    handleSubmit,
    watch,
    reset,
  } = methods;

  const defaultConfig = useMemo(() => {
    const hasData = Object.keys(connectorData.config).length > 0;

    return hasData ? JSON.stringify(connectorData.config, null, 2) : connectorData.configTemplate;
  }, [connectorData]);

  const onSubmit = handleSubmit(async ({ configJson }) => {
    if (!configJson) {
      toast.error(t('connector_details.save_error_empty_config'));

      return;
    }

    const result = safeParseJson(configJson);

    if (!result.success) {
      toast.error(result.error);

      return;
    }

    const connectorResponse = await api
      .patch(`/api/connectors/${connectorData.id}`, { json: { config: result.data } })
      .json<Connector & { metadata: ConnectorMetadata; type: ConnectorType }>();

    onConnectorUpdated(connectorResponse);
    reset({ configJson: JSON.stringify(result.data, null, 2) });
    toast.success(t('general.saved'));
  });

  return (
    <>
      <div className={styles.main}>
        <form {...methods}>
          <Controller
            name="configJson"
            control={control}
            defaultValue={defaultConfig}
            render={({ field: { onChange, value } }) => (
              <FormField title="connector_details.edit_config_label">
                <CodeEditor
                  className={styles.codeEditor}
                  language="json"
                  value={value}
                  onChange={onChange}
                />
              </FormField>
            )}
          />
        </form>
        {connectorData.type !== ConnectorType.Social && (
          <SenderTester
            connectorId={connectorData.id}
            connectorType={connectorData.type}
            config={watch('configJson')}
          />
        )}
      </div>
      <div className={detailsStyles.footer}>
        <div className={detailsStyles.footerMain}>
          <Button
            type="primary"
            size="large"
            title="general.save_changes"
            isLoading={isSubmitting}
            onClick={onSubmit}
          />
        </div>
      </div>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </>
  );
};

export default ConnectorContent;
