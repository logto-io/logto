import { ConnectorType } from '@logto/schemas';
import type { ConnectorResponse } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import BasicForm from '@/components/ConnectorForm/BasicForm';
import ConfigForm from '@/components/ConnectorForm/ConfigForm';
import ConnectorTester from '@/components/ConnectorTester';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import { useConnectorFormConfigParser } from '@/hooks/use-connector-form-config-parser';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { SyncProfileMode } from '@/types/connector';
import type { ConnectorFormType } from '@/types/connector';
import { initFormData } from '@/utils/connector-form';
import { trySubmitSafe } from '@/utils/form';

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

  const formConfig = useMemo(() => {
    const { formItems, config } = connectorData;
    return conditional(formItems && initFormData(formItems, config)) ?? {};
  }, [connectorData]);

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
    setValue,
  } = methods;
  const isSocialConnector = connectorData.type === ConnectorType.Social;

  useEffect(() => {
    const { metadata, config, syncProfile } = connectorData;
    const { name, logo, logoDark } = metadata;

    reset({
      target: getConnectorTarget(connectorData),
      logo,
      logoDark: logoDark ?? '',
      name: name?.en,
      jsonConfig: JSON.stringify(config, null, 2),
      syncProfile: syncProfile ? SyncProfileMode.EachSignIn : SyncProfileMode.OnlyAtRegister,
    });
    /**
     * Note:
     * Set `formConfig` independently.
     * Since react-hook-form's reset function infers `Record<string, unknown>` to `{ [x: string]: {} | undefined }` incorrectly.
     */
    setValue('formConfig', formConfig, { shouldDirty: false });
  }, [connectorData, formConfig, reset, setValue]);

  const configParser = useConnectorFormConfigParser();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
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
    })
  );

  return (
    <FormProvider {...methods}>
      <DetailsForm
        autoComplete="off"
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={() => {
          reset();
          /**
           * Note:
           * Reset `formConfig` manually since react-hook-form's `useForm` hook infers `Record<string, unknown>` to `{ [x: string]: {} | undefined }` incorrectly,
           * this causes we cannot apply the default value of `formConfig` to the form.
           */
          setValue('formConfig', formConfig, { shouldDirty: false });
        }}
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
            <ConnectorTester
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
