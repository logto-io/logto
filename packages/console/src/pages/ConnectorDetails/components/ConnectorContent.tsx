import type { ConnectorResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import ConnectorForm from '@/pages/Connectors/components/ConnectorForm';
import type { ConnectorFormType } from '@/pages/Connectors/types';
import { SyncProfileMode } from '@/pages/Connectors/types';
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
  const methods = useForm<ConnectorFormType>({
    reValidateMode: 'onBlur',
    defaultValues: {
      syncProfile: SyncProfileMode.OnlyAtRegister,
    },
  });
  const {
    formState: { isSubmitting, isDirty },
    handleSubmit,
    watch,
    reset,
  } = methods;

  useEffect(() => {
    const { name, logo, logoDark, target } = connectorData.metadata;
    const { config, syncProfile } = connectorData;
    reset({
      target,
      logo,
      logoDark: logoDark ?? '',
      name: name?.en,
      config: JSON.stringify(config, null, 2),
      syncProfile: syncProfile ? SyncProfileMode.EachSignIn : SyncProfileMode.OnlyAtRegister,
    });
  }, [connectorData, reset]);

  const onSubmit = handleSubmit(async ({ config, syncProfile, ...metadata }) => {
    if (!config) {
      toast.error(t('connector_details.save_error_empty_config'));

      return;
    }

    const result = safeParseJson(config);

    if (!result.success) {
      toast.error(result.error);

      return;
    }

    const payload = {
      config: result.data,
      syncProfile: syncProfile === SyncProfileMode.EachSignIn,
    };
    const standardConnectorPayload = {
      ...payload,
      metadata: { ...metadata, name: { en: metadata.name } },
    };
    const body = connectorData.isStandard ? standardConnectorPayload : payload;

    const updatedConnector = await api
      .patch(`/api/connectors/${connectorData.id}`, {
        json: body,
      })
      .json<ConnectorResponse>();

    onConnectorUpdated(updatedConnector);
    toast.success(t('general.saved'));
  });

  return (
    <FormProvider {...methods}>
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
          <ConnectorForm connector={connectorData} />
          {connectorData.type !== ConnectorType.Social && (
            <SenderTester
              className={styles.senderTest}
              connectorId={connectorData.id}
              connectorType={connectorData.type}
              config={watch('config')}
            />
          )}
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </FormProvider>
  );
};

export default ConnectorContent;
