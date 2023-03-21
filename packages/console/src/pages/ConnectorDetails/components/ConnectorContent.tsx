import type { ConnectorResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import BasicForm from '@/pages/Connectors/components/ConnectorForm/BasicForm';
import ConfigForm from '@/pages/Connectors/components/ConnectorForm/ConfigForm';
import { useConnectorFormConfigParser } from '@/pages/Connectors/components/ConnectorForm/hooks';
import { initFormData } from '@/pages/Connectors/components/ConnectorForm/utils';
import type { ConnectorFormType } from '@/pages/Connectors/types';
import { SyncProfileMode } from '@/pages/Connectors/types';

import SenderTester from './SenderTester';

type Props = {
  isDeleted: boolean;
  connectorData: ConnectorResponse;
  onConnectorUpdated: (connector: ConnectorResponse) => void;
};

const getConnectorTarget = (connectorData: ConnectorResponse): Optional<string> => {
  return conditional(
    connectorData.type === ConnectorType.Social &&
      !connectorData.isStandard &&
      (connectorData.metadata.target ?? connectorData.target)
  );
};

function ConnectorContent({ isDeleted, connectorData, onConnectorUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const api = useApi();
  const methods = useForm<ConnectorFormType>({
    reValidateMode: 'onBlur',
    defaultValues: {
      syncProfile: SyncProfileMode.OnlyAtRegister,
      target: getConnectorTarget(connectorData),
    },
  });
  const {
    formState: { isSubmitting, isDirty },
    handleSubmit,
    watch,
    reset,
  } = methods;
  const isSocialConnector = connectorData.type === ConnectorType.Social;

  useEffect(() => {
    const { formItems, metadata, config, syncProfile } = connectorData;
    const { name, logo, logoDark, target } = metadata;

    reset({
      ...(formItems ? initFormData(formItems, config) : {}),
      target: getConnectorTarget(connectorData) ?? target,
      logo,
      logoDark: logoDark ?? '',
      name: name?.en,
      config: JSON.stringify(config, null, 2),
      syncProfile: syncProfile ? SyncProfileMode.EachSignIn : SyncProfileMode.OnlyAtRegister,
    });
  }, [connectorData, reset]);

  const configParser = useConnectorFormConfigParser();

  const onSubmit = handleSubmit(async (data) => {
    const { formItems, isStandard, id } = connectorData;
    const config = configParser(data, formItems);
    const { syncProfile, name, logo, logoDark, target } = data;

    const payload = isSocialConnector
      ? {
          config,
          syncProfile: syncProfile === SyncProfileMode.EachSignIn,
        }
      : { config };
    const standardConnectorPayload = {
      ...payload,
      metadata: { name: { en: name }, logo, logoDark, target },
    };
    // Should not update `target` for neither passwordless connectors nor non-standard social connectors.
    const body = isStandard ? standardConnectorPayload : { ...payload, target: undefined };

    const updatedConnector = await api
      .patch(`api/connectors/${id}`, {
        json: body,
      })
      .json<ConnectorResponse>();

    onConnectorUpdated(updatedConnector);
    toast.success(t('general.saved'));
  });

  return (
    <FormProvider {...methods}>
      <DetailsForm
        autoComplete="off"
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        {isSocialConnector && (
          <FormCard
            title="connector_details.settings"
            description="connector_details.settings_description"
            learnMoreLink={getDocumentationUrl('/docs/references/connectors')}
          >
            <BasicForm
              isStandard={connectorData.isStandard}
              isDarkDefaultVisible={Boolean(connectorData.metadata.logoDark)}
            />
          </FormCard>
        )}
        <FormCard
          title="connector_details.parameter_configuration"
          description={conditional(!isSocialConnector && 'connector_details.settings_description')}
          learnMoreLink={conditional(
            !isSocialConnector && getDocumentationUrl('/docs/references/connectors')
          )}
        >
          <ConfigForm
            formItems={connectorData.formItems}
            connectorId={connectorData.id}
            connectorType={connectorData.type}
          />
        </FormCard>
        {/* Tell typescript that the connectorType is Email or Sms */}
        {connectorData.type !== ConnectorType.Social && (
          <FormCard title="connector_details.test_connection">
            <SenderTester
              connectorFactoryId={connectorData.connectorId}
              connectorType={connectorData.type}
              parse={() => configParser(watch(), connectorData.formItems)}
            />
          </FormCard>
        )}
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </FormProvider>
  );
}

export default ConnectorContent;
