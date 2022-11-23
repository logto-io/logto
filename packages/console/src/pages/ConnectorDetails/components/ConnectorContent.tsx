import type { Connector, ConnectorResponse, ConnectorMetadata } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import CodeEditor from '@/components/CodeEditor';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
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
  const { connectorId } = useParams();
  const api = useApi();
  const {
    control,
    formState: { isSubmitting, isDirty },
    handleSubmit,
    watch,
    reset,
  } = useForm<{ configJson: string }>({ reValidateMode: 'onBlur' });

  const defaultConfig = useMemo(() => {
    const hasData = Object.keys(connectorData.config).length > 0;

    return hasData ? JSON.stringify(connectorData.config, null, 2) : connectorData.configTemplate;
  }, [connectorData]);

  useEffect(() => {
    reset();
  }, [connectorId, reset]);

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

    const { metadata, ...rest } = await api
      .patch(`/api/connectors/${connectorData.id}`, { json: { config: result.data } })
      .json<Connector & { metadata: ConnectorMetadata; type: ConnectorType }>();

    onConnectorUpdated({ ...rest, ...metadata });
    reset({ configJson: JSON.stringify(result.data, null, 2) });
    toast.success(t('general.saved'));
  });

  return (
    <>
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        <FormCard
          title="connector_details.settings"
          description="connector_details.settings_description"
          learnMoreLink="https://docs.logto.io/docs/references/connectors"
        >
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
          {connectorData.type !== ConnectorType.Social && (
            <SenderTester
              className={styles.senderTest}
              connectorId={connectorData.id}
              connectorType={connectorData.type}
              config={watch('configJson')}
            />
          )}
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </>
  );
};

export default ConnectorContent;
