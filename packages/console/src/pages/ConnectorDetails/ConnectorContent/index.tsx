import { ServiceConnector } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import type { ConnectorResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useEffect, useMemo } from 'react';
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
import { convertResponseToForm } from '@/utils/connector-form';
import { trySubmitSafe } from '@/utils/form';

import EmailServiceConnectorForm from './EmailServiceConnectorForm';

type Props = {
  readonly isDeleted: boolean;
  readonly connectorData: ConnectorResponse;
  readonly onConnectorUpdated: (connector?: ConnectorResponse) => void;
};

function ConnectorContent({ isDeleted, connectorData, onConnectorUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const api = useApi();
  const formData = useMemo(() => convertResponseToForm(connectorData), [connectorData]);

  const methods = useForm<ConnectorFormType>({
    reValidateMode: 'onBlur',
    defaultValues: {
      ...formData,
      /**
       * Note:
       * The `formConfig` will be setup in the `useEffect` hook since react-hook-form's `useForm` hook infers `Record<string, unknown>` to `{ [x: string]: {} | undefined }` incorrectly,
       * this causes we cannot apply the default value of `formConfig` to the form.
       */
      formConfig: {},
    },
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
    metadata: { logoDark },
  } = connectorData;

  const isSocialConnector = connectorType === ConnectorType.Social;
  const isEmailServiceConnector = connectorId === ServiceConnector.Email;

  useEffect(() => {
    /**
     * Note: should not refresh form data when the form is dirty.
     */
    if (isDirty) {
      return;
    }
    reset(formData);
  }, [formData, isDirty, reset]);

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
            description="connector_details.settings_description"
            learnMoreLink={{
              href: getDocumentationUrl('/docs/references/connectors'),
              targetBlank: 'noopener',
            }}
          >
            <BasicForm isStandard={isStandardConnector} isDarkDefaultVisible={Boolean(logoDark)} />
          </FormCard>
        )}
        {isEmailServiceConnector ? (
          <EmailServiceConnectorForm extraInfo={connectorData.extraInfo} />
        ) : (
          <FormCard
            title="connector_details.parameter_configuration"
            description={conditional(
              !isSocialConnector && 'connector_details.settings_description'
            )}
            learnMoreLink={conditional(
              !isSocialConnector && {
                href: getDocumentationUrl('/docs/references/connectors'),
                targetBlank: 'noopener',
              }
            )}
          >
            <ConfigForm
              formItems={formItems}
              connectorFactoryId={connectorId}
              connectorId={id}
              connectorType={connectorType}
            />
          </FormCard>
        )}
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
