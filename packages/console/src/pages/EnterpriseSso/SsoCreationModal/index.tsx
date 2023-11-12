import {
  type SsoConnectorFactoriesResponse,
  type SsoConnectorWithProviderConfig,
} from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWR from 'swr';

import Skeleton from '@/components/CreateConnectorForm/Skeleton';
import { getConnectorRadioGroupSize } from '@/components/CreateConnectorForm/utils';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import { type RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import SsoConnectorRadioGroup from './SsoConnectorRadioGroup';
import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onClose: (ssoConnector?: SsoConnectorWithProviderConfig) => void;
};

type FormType = {
  connectorName: string;
};

function SsoCreationModal({ isOpen, onClose: rawOnClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [selectedProviderName, setSelectedProviderName] = useState<string>();
  const { data, error } = useSWR<SsoConnectorFactoriesResponse, RequestError>(
    'api/sso-connector-factories'
  );
  const {
    reset,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormType>();
  const api = useApi();

  const isLoading = !data && !error;

  const { standardConnectors = [], providerConnectors = [] } = data ?? {};

  const radioGroupSize = useMemo(
    () => getConnectorRadioGroupSize(standardConnectors.length + providerConnectors.length),
    [standardConnectors, providerConnectors]
  );

  const isCreateButtonDisabled = useMemo(
    () =>
      ![...standardConnectors, ...providerConnectors].some(
        ({ providerName }) => selectedProviderName === providerName
      ),
    [selectedProviderName, standardConnectors, providerConnectors]
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

      const createdSsoConnector = await api
        .post(`api/sso-connectors`, { json: { ...formData, providerName: selectedProviderName } })
        .json<SsoConnectorWithProviderConfig>();

      onClose(createdSsoConnector);
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
          <Button
            title="enterprise_sso.create_modal.create_button_text"
            type="primary"
            disabled={isCreateButtonDisabled}
            onClick={onSubmit}
          />
        }
        size={radioGroupSize}
        onClose={onClose}
      >
        {isLoading && <Skeleton numberOfLoadingConnectors={2} />}
        {error?.message}
        {providerConnectors.length > 0 && (
          <>
            <SsoConnectorRadioGroup
              name="providerConnectors"
              value={selectedProviderName}
              connectors={providerConnectors}
              size={radioGroupSize}
              onChange={handleSsoSelection}
            />
            <div className={styles.textDivider}>
              <DynamicT forKey="enterprise_sso.create_modal.text_divider" />
            </div>
          </>
        )}
        <SsoConnectorRadioGroup
          name="standardConnectors"
          value={selectedProviderName}
          connectors={standardConnectors}
          size={radioGroupSize}
          onChange={handleSsoSelection}
        />
        <FormField isRequired title="enterprise_sso.create_modal.connector_name_field_title">
          <TextInput
            {...register('connectorName', { required: true })}
            placeholder={t('enterprise_sso.create_modal.connector_name_field_placeholder')}
            error={Boolean(errors.connectorName)}
          />
        </FormField>
      </ModalLayout>
    </Modal>
  );
}

export default SsoCreationModal;
