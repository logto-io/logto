import { ServiceConnector, GoogleConnector } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import type { ConnectorResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import BasicForm from '@/components/ConnectorForm/BasicForm';
import ConfigForm from '@/components/ConnectorForm/ConfigForm';
import GoogleOneTapCard from '@/components/ConnectorForm/GoogleOneTapCard';
import ConnectorTester from '@/components/ConnectorTester';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { connectors, emailConnectors } from '@/consts';
import useApi from '@/hooks/use-api';
import { useConnectorFormConfigParser } from '@/hooks/use-connector-form-config-parser';
import { SyncProfileMode } from '@/types/connector';
import type { ConnectorFormType } from '@/types/connector';
import { convertResponseToForm } from '@/utils/connector-form';
import { trySubmitSafe } from '@/utils/form';
import { removeFalsyValues } from '@/utils/object';

import EmailServiceConnectorForm from './EmailServiceConnectorForm';

type Props = {
  readonly isDeleted: boolean;
  readonly connectorData: ConnectorResponse;
  readonly onConnectorUpdated: (connector?: ConnectorResponse) => void;
};

function ConnectorContent({ isDeleted, connectorData, onConnectorUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const formData = useMemo(() => convertResponseToForm(connectorData), [connectorData]);

  const methods = useForm<ConnectorFormType>({
    reValidateMode: 'onBlur',
    // eslint-disable-next-line no-restricted-syntax -- The original type will cause "infinitely deep type" error.
    defaultValues: formData as Record<string, unknown>,
  });

  const {
    formState: { isSubmitting, isDirty },
    handleSubmit,
    watch,
    reset,
  } = methods;

  const {
    id,
    connectorId,
    type: connectorType,
    formItems,
    isStandard: isStandardConnector,
    isTokenStorageSupported,
  } = connectorData;

  const isSocialConnector = connectorType === ConnectorType.Social;
  const isEmailServiceConnector = connectorId === ServiceConnector.Email;

  const configParser = useConnectorFormConfigParser();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      const { formItems, isStandard, id } = connectorData;
      const { syncProfile, name, logo, logoDark, target, rawConfig, enableTokenStorage } = data;
      // Apply the raw config first to avoid losing data updated from other forms that are not
      // included in the form items.
      // Explicitly SKIP falsy values removal logic (the last argument of `configParser()` method) for social connectors.
      const config = removeFalsyValues({
        ...rawConfig,
        ...configParser(data, formItems, isSocialConnector),
      });

      const payload = isSocialConnector
        ? {
            config,
            syncProfile: syncProfile === SyncProfileMode.EachSignIn,
            enableTokenStorage,
          }
        : { config };
      const standardConnectorPayload = {
        ...payload,
        metadata: { name: { en: name }, target, ...removeFalsyValues({ logo, logoDark }) },
      };
      // Should not update `target` for neither passwordless connectors nor non-standard social connectors.
      const body = isStandard ? standardConnectorPayload : { ...payload, target: undefined };

      const updatedConnector = await api
        .patch(`api/connectors/${id}`, {
          json: body,
        })
        .json<ConnectorResponse>();
      /**
       * Note: reset form dirty state before updating the form data.
       */
      reset(convertResponseToForm(updatedConnector));
      onConnectorUpdated(updatedConnector);
      toast.success(t('general.saved'));
    })
  );

  const updateUsage = useCallback(() => {
    if (connectorData.usage === undefined) {
      return;
    }
    onConnectorUpdated();
  }, [connectorData, onConnectorUpdated]);

  return (
    <FormProvider {...methods}>
      <DetailsForm
        autoComplete="off"
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={() => {
          reset();
        }}
        onSubmit={onSubmit}
      >
        {isSocialConnector && (
          <FormCard
            title="connector_details.settings"
            description={
              isTokenStorageSupported
                ? 'connector_details.setting_description_with_token_storage_supported'
                : 'connector_details.settings_description'
            }
            learnMoreLink={{ href: connectors }}
          >
            <BasicForm
              isStandard={isStandardConnector}
              isTokenStorageSupported={isTokenStorageSupported}
            />
          </FormCard>
        )}
        {isEmailServiceConnector ? (
          <EmailServiceConnectorForm extraInfo={connectorData.extraInfo} />
        ) : (
          <FormCard
            title="connector_details.parameter_configuration"
            description={conditional(
              !isSocialConnector && 'connector_details.email_connector_settings_description'
            )}
            learnMoreLink={conditional(!isSocialConnector && { href: emailConnectors })}
          >
            <ConfigForm
              formItems={formItems}
              connectorFactoryId={connectorId}
              connectorId={id}
              connectorType={connectorType}
            />
          </FormCard>
        )}
        {connectorId === GoogleConnector.factoryId && <GoogleOneTapCard />}
        {!isSocialConnector && (
          <FormCard title="connector_details.test_connection">
            <ConnectorTester
              connectorFactoryId={connectorId}
              connectorType={connectorType}
              parse={() => configParser(watch(), formItems)}
              updateUsage={updateUsage}
            />
          </FormCard>
        )}
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </FormProvider>
  );
}

export default ConnectorContent;
