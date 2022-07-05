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
  connectorId?: string;
  data: ConnectorDTO;
  onMutate: (connector: ConnectorDTO) => void;
};

const ConnectorContent = ({ connectorId, data, onMutate }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [config, setConfig] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const api = useApi();

  const defaultConfig = useMemo(() => {
    const hasData = Object.keys(data.config).length > 0;

    return hasData ? JSON.stringify(data.config, null, 2) : data.configTemplate;
  }, [data]);

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
    if (!connectorId) {
      return;
    }

    setSaveError(undefined);

    if (!config) {
      setSaveError(t('connector_details.save_error_empty_config'));

      return;
    }

    try {
      const configJson = JSON.parse(config) as JSON;
      setIsSubmitting(true);
      const { metadata, ...reset } = await api
        .patch(`/api/connectors/${connectorId}`, {
          json: { config: configJson },
        })
        .json<
          Connector & {
            metadata: ConnectorMetadata;
          }
        >();
      onMutate({ ...reset, ...metadata });
      toast.success(t('general.saved'));
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        setSaveError(t('connector_details.save_error_json_parse_error'));
      }
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <div className={styles.main}>
        <FormField title="admin_console.connector_details.edit_config_label">
          <CodeEditor
            className={styles.codeEditor}
            language="json"
            value={config}
            onChange={(value) => {
              setConfig(value);
            }}
          />
        </FormField>
        {data.type !== ConnectorType.Social && (
          <SenderTester connectorId={data.id} connectorType={data.type} config={config} />
        )}
        {saveError && <div>{saveError}</div>}
      </div>
      <div className={detailsStyles.footer}>
        <div className={detailsStyles.footerMain}>
          <Button
            type="primary"
            size="large"
            title="admin_console.general.save_changes"
            isLoading={isSubmitting}
            onClick={handleSave}
          />
        </div>
      </div>
      <UnsavedChangesAlertModal hasUnsavedChanges={hasUnsavedChanges} />
    </>
  );
};

export default ConnectorContent;
