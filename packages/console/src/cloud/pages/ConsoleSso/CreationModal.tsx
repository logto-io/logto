import { type consoleSsoRouter } from '@logto/cloud/routes';
import { SsoProviderName } from '@logto/schemas';
import Client, {
  type GuardedResponse,
  type ResponseError,
  type RouterRoutes,
} from '@withtyped/client';
import { useState } from 'react';
import Modal from 'react-modal';
import useSWR from 'swr';
import { z } from 'zod';

import { useCloudApi, toastResponseError } from '@/cloud/hooks/use-cloud-api';
import Skeleton from '@/components/CreateConnectorForm/Skeleton';
import { getConnectorRadioGroupSize } from '@/components/CreateConnectorForm/utils';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import ModalLayout from '@/ds-components/ModalLayout';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import SsoConnectorRadioGroup from '@/pages/EnterpriseSso/SsoCreationModal/SsoConnectorRadioGroup';
import creationStyles from '@/pages/EnterpriseSso/SsoCreationModal/index.module.scss';
import { categorizeSsoConnectorProviders } from '@/pages/EnterpriseSso/SsoCreationModal/utils';
import modalStyles from '@/scss/modal.module.scss';

import {
  clearPendingConnectorCreation,
  readPendingConnectorCreation,
  getOrCreatePendingConnectorCreation,
} from './connector-creation-idempotency';
import styles from './index.module.scss';
import { useConsoleSsoConnectors } from './use-console-sso';

type Props = {
  readonly onClose: (id?: string) => void;
  readonly userId: string;
};

function CreationModal({ onClose, userId }: Props) {
  const { show } = useConfirmModal();
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  const { mutate } = useConsoleSsoConnectors();
  const {
    data: providers,
    error,
    mutate: refreshProviders,
  } = useSWR<
    GuardedResponse<RouterRoutes<typeof consoleSsoRouter>['get']['/api/me/console-sso/providers']>,
    ResponseError
  >(['/api/me/console-sso/providers', userId], async () =>
    api.get('/api/me/console-sso/providers')
  );
  const [operation, setOperation] = useState(() => readPendingConnectorCreation(userId));
  const [selected, setSelected] = useState<string | undefined>(operation?.providerName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enterpriseProviders, standardProviders } = categorizeSsoConnectorProviders(providers);
  const radioGroupSize = getConnectorRadioGroupSize(
    enterpriseProviders.length + standardProviders.length
  );
  const create = async () => {
    if (isSubmitting || !selected) {
      return;
    }
    setIsSubmitting(true);
    try {
      const current = getOrCreatePendingConnectorCreation(
        userId,
        z.nativeEnum(SsoProviderName).parse(selected)
      );
      setOperation(current);
      const createApi = new Client<typeof consoleSsoRouter>({
        ...api.config,
        headers: async (url, method) => ({
          ...(typeof api.config.headers === 'function'
            ? await api.config.headers(url, method)
            : api.config.headers),
          'Idempotency-Key': current.key,
        }),
      });
      const connector = await createApi.post('/api/me/console-sso/connectors', {
        body: { providerName: current.providerName },
      });
      clearPendingConnectorCreation(userId);
      await Promise.allSettled([mutate()]);
      onClose(connector.id);
    } catch (error) {
      await Promise.allSettled([mutate()]);
      await toastResponseError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const select = (provider: string) => {
    if (!operation && !isSubmitting) {
      setSelected(provider);
    }
  };
  const isProviderDisabled = (providerName: string) =>
    isSubmitting || Boolean(operation && operation.providerName !== providerName);
  const startOver = async () => {
    const [confirmed] = await show({
      title: 'cloud.console_sso.start_over',
      confirmButtonText: 'cloud.console_sso.start_over',
      confirmButtonType: 'primary',
      ModalContent: () => <DynamicT forKey="cloud.console_sso.start_over_confirmation" />,
    });
    if (!confirmed) {
      return;
    }
    try {
      clearPendingConnectorCreation(userId);
      setOperation(undefined);
      setSelected(undefined);
    } catch (error) {
      await toastResponseError(error);
    }
  };
  return (
    <Modal
      isOpen
      shouldCloseOnEsc={!isSubmitting}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <ModalLayout
        title="cloud.console_sso.create"
        size="xlarge"
        footer={
          <Button
            title="enterprise_sso.create_modal.create_button_text"
            type="primary"
            disabled={
              !providers?.some(({ providerName }) => providerName === selected) || Boolean(error)
            }
            isLoading={isSubmitting}
            onClick={create}
          />
        }
        onClose={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
      >
        {operation && !isSubmitting && (
          <InlineNotification
            className={styles.creationNotice}
            severity="info"
            action="cloud.console_sso.start_over"
            onClick={() => {
              void startOver();
            }}
          >
            <DynamicT forKey="cloud.console_sso.resume_creation" />
          </InlineNotification>
        )}
        {!providers && !error && <Skeleton numberOfLoadingConnectors={2} />}
        {error && (
          <InlineNotification className={styles.creationNotice} severity="error">
            {error.message}
            <Button
              title="general.retry"
              onClick={() => {
                void refreshProviders();
              }}
            />
          </InlineNotification>
        )}
        <SsoConnectorRadioGroup
          name="enterpriseProviders"
          value={selected}
          connectors={enterpriseProviders}
          size={radioGroupSize}
          isProviderDisabled={isProviderDisabled}
          onChange={select}
        />
        <div className={creationStyles.textDivider}>
          <DynamicT forKey="enterprise_sso.create_modal.text_divider" />
        </div>
        <SsoConnectorRadioGroup
          name="standardProviders"
          value={selected}
          connectors={standardProviders}
          size={radioGroupSize}
          isProviderDisabled={isProviderDisabled}
          onChange={select}
        />
      </ModalLayout>
    </Modal>
  );
}

export default CreationModal;
