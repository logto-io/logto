import { Connector, ConnectorDTO, ConnectorMetadata, ConnectorType } from '@logto/schemas';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import CodeEditor from '@/components/CodeEditor';
import FormField from '@/components/FormField';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import * as detailsStyles from '@/scss/details.module.scss';

import * as styles from '../index.module.scss';
import SenderTester from './SenderTester';

type Props = {
  isDeleted: boolean;
  connectorData: ConnectorDTO;
  onConnectorUpdated: (connector: ConnectorDTO) => void;
};

const ConnectorContent = ({ isDeleted, connectorData, onConnectorUpdated }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [config, setConfig] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const api = useApi();

  const defaultConfig = useMemo(() => {
    const hasData = Object.keys(connectorData.config).length > 0;

    return hasData ? JSON.stringify(connectorData.config, null, 2) : connectorData.configTemplate;
  }, [connectorData]);

  useEffect(() => {
    setConfig(defaultConfig);

    return () => {
      setConfig(defaultConfig);
    };
  }, [defaultConfig]);

  const hasUnsavedChanges = useMemo(() => {
    if (!config) {
      return false;
    }

    try {
      const parsedConfig = JSON.stringify(JSON.parse(config), null, 2);

      return parsedConfig !== defaultConfig;
    } catch {
      return true;
    }
  }, [config, defaultConfig]);

  const handleSave = async () => {
    if (!config) {
      toast.error(t('connector_details.save_error_empty_config'));

      return;
    }

    try {
      const configJson = JSON.parse(config) as JSON;
      setIsSubmitting(true);
      const { metadata, ...reset } = await api
        .patch(`/api/connectors/${connectorData.id}`, {
          json: { config: configJson },
        })
        .json<
          Connector & {
            metadata: ConnectorMetadata;
          }
        >();
      onConnectorUpdated({ ...reset, ...metadata });
      toast.success(t('general.saved'));
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        toast.error(t('connector_details.save_error_json_parse_error'));
      } else {
        toast.error(t('errors.unexpected_error'));
      }
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <div className={styles.main}>
        <FormField title="connector_details.edit_config_label">
          <CodeEditor
            className={styles.codeEditor}
            language="json"
            value={config}
            onChange={(value) => {
              setConfig(value);
            }}
          />
        </FormField>
        {connectorData.type !== ConnectorType.Social && (
          <SenderTester
            connectorId={connectorData.id}
            connectorType={connectorData.type}
            config={config}
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
            onClick={handleSave}
          />
        </div>
      </div>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && hasUnsavedChanges} />
    </>
  );
};

export default ConnectorContent;
