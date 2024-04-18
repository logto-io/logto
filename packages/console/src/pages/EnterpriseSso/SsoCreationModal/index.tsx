import {
  type RequestErrorBody,
  type SsoConnectorProvidersResponse,
  type SsoConnectorWithProviderConfig,
} from '@logto/schemas';
import { HTTPError } from 'ky';
import { useContext, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWR from 'swr';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import Skeleton from '@/components/CreateConnectorForm/Skeleton';
import { getConnectorRadioGroupSize } from '@/components/CreateConnectorForm/utils';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import useApi, { type RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import SsoConnectorRadioGroup from './SsoConnectorRadioGroup';
import * as styles from './index.module.scss';
import { categorizeSsoConnectorProviders } from './utils';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: (ssoConnector?: SsoConnectorWithProviderConfig) => void;
};

type FormType = {
  connectorName: string;
};

const duplicateConnectorNameErrorCode = 'single_sign_on.duplicate_connector_name';

function SsoCreationModal({ isOpen, onClose: rawOnClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { currentPlan } = useContext(SubscriptionDataContext);
  const [selectedProviderName, setSelectedProviderName] = useState<string>();

  const isSsoEnabled = !isCloud || currentPlan.quota.ssoEnabled;

  const { data, error } = useSWR<SsoConnectorProvidersResponse, RequestError>(
    'api/sso-connector-providers'
  );
  const {
    reset,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    watch,
  } = useForm<FormType>({ resetOptions: { keepErrors: true } });
  const api = useApi({ hideErrorToast: true });

  const isLoading = !data && !error;

  const { standardProviders, enterpriseProviders } = categorizeSsoConnectorProviders(data);

  const radioGroupSize = getConnectorRadioGroupSize(
    standardProviders.length + enterpriseProviders.length
  );

  const isAnyConnectorSelected = useMemo(
    () =>
      [...standardProviders, ...enterpriseProviders].some(
        ({ providerName }) => selectedProviderName === providerName
      ),
    [enterpriseProviders, selectedProviderName, standardProviders]
  );

  // `rawOnClose` does not clean the state of the modal.
  const onClose = (ssoConnector?: SsoConnectorWithProviderConfig) => {
    setSelectedProviderName(undefined);
    reset();
    rawOnClose(ssoConnector);
  };

  const handleSsoSelection = (providerName: string) => {
    setSelectedProviderName(providerName);
  };

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      try {
        const createdSsoConnector = await api
          .post(`api/sso-connectors`, { json: { ...formData, providerName: selectedProviderName } })
          .json<SsoConnectorWithProviderConfig>();

        onClose(createdSsoConnector);
      } catch (error: unknown) {
        if (error instanceof HTTPError) {
          const { response } = error;
          const metadata = await response.clone().json<RequestErrorBody>();

          if (metadata.code === duplicateConnectorNameErrorCode) {
            setError('connectorName', { type: 'custom', message: metadata.message });
          }
        }
      }
    })
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="enterprise_sso.create_modal.title"
        footer={
          isSsoEnabled ? (
            <Button
              title="enterprise_sso.create_modal.create_button_text"
              type="primary"
              disabled={
                // The button is available only when:
                // 1. `connectorName` field is not empty.
                // 2. At least one connector is selected.
                // 3. Error is resolved. Since `connectorName` is the only field of this form, it means `connectorName` field error is resolved.
                !(watch('connectorName') && isAnyConnectorSelected) || Boolean(errors.connectorName)
              }
              onClick={onSubmit}
            />
          ) : (
            <QuotaGuardFooter>
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                }}
              >
                {t('upsell.paywall.sso_connectors')}
              </Trans>
            </QuotaGuardFooter>
          )
        }
        size="xlarge"
        onClose={onClose}
      >
        {isLoading && <Skeleton numberOfLoadingConnectors={2} />}
        {error?.message}
        <SsoConnectorRadioGroup
          name="enterpriseProviders"
          value={selectedProviderName}
          connectors={enterpriseProviders}
          size={radioGroupSize}
          onChange={handleSsoSelection}
        />
        <div className={styles.textDivider}>
          <DynamicT forKey="enterprise_sso.create_modal.text_divider" />
        </div>
        <SsoConnectorRadioGroup
          name="standardProviders"
          value={selectedProviderName}
          connectors={standardProviders}
          size={radioGroupSize}
          onChange={handleSsoSelection}
        />
        <FormField isRequired title="enterprise_sso.create_modal.connector_name_field_title">
          <TextInput
            {...register('connectorName', { required: true })}
            placeholder={t('enterprise_sso.create_modal.connector_name_field_placeholder')}
            error={errors.connectorName?.message}
          />
        </FormField>
      </ModalLayout>
    </Modal>
  );
}

export default SsoCreationModal;
