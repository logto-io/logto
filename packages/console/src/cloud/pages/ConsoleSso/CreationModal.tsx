import { type consoleSsoRouter } from '@logto/cloud/routes';
import { SsoProviderName, type SsoConnectorProvidersResponse } from '@logto/schemas';
import Client, { type ResponseError } from '@withtyped/client';
import { useState } from 'react';
import Modal from 'react-modal';
import useSWR from 'swr';
import { z } from 'zod';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import Skeleton from '@/components/CreateConnectorForm/Skeleton';
import { getConnectorRadioGroupSize } from '@/components/CreateConnectorForm/utils';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import ModalLayout from '@/ds-components/ModalLayout';
import SsoConnectorRadioGroup from '@/pages/EnterpriseSso/SsoCreationModal/SsoConnectorRadioGroup';
import creationStyles from '@/pages/EnterpriseSso/SsoCreationModal/index.module.scss';
import { categorizeSsoConnectorProviders } from '@/pages/EnterpriseSso/SsoCreationModal/utils';
import modalStyles from '@/scss/modal.module.scss';

import { finishCreation, readCreation, startCreation } from './creation';
import { useConsoleSsoContext, useConsoleSsoConnectors } from './use-console-sso';

type Props = {
  readonly onClose: (id?: string) => void;
  readonly userId: string;
  readonly customerId: string;
};

function CreationModal({ onClose, userId, customerId }: Props) {
  const { api, mutate: refreshContext } = useConsoleSsoContext();
  const { mutate } = useConsoleSsoConnectors();
  const {
    data: providers,
    error,
    mutate: refreshProviders,
  } = useSWR<SsoConnectorProvidersResponse, ResponseError>(
    ['/api/me/console-sso/providers', userId],
    async () => api.get('/api/me/console-sso/providers')
  );
  const [operation, setOperation] = useState(() => readCreation(userId, customerId));
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
      const context = await refreshContext();
      if (context?.userId !== userId || context.stripeCustomerId !== customerId) {
        return;
      }
      const current = startCreation(
        userId,
        customerId,
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
          'X-Logto-Expected-Customer': customerId,
        }),
      });
      const connector = await createApi.post('/api/me/console-sso/connectors', {
        body: { providerName: current.providerName },
      });
      finishCreation(userId, customerId);
      void mutate();
      onClose(connector.id);
    } catch (error) {
      await Promise.allSettled([mutate(), refreshContext()]);
      await toastResponseError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const select = (provider: string) => {
    if (!operation) {
      setSelected(provider);
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
        title="enterprise_sso.create_modal.title"
        size="xlarge"
        footer={
          <Button
            title="enterprise_sso.create_modal.create_button_text"
            type="primary"
            disabled={!selected || !providers || Boolean(error)}
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
        <InlineNotification severity="info">
          <DynamicT
            forKey={operation ? 'console_sso.resume_creation' : 'console_sso.scope_description'}
          />
        </InlineNotification>
        {!providers && !error && <Skeleton numberOfLoadingConnectors={2} />}
        {error && (
          <InlineNotification severity="error">
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
          onChange={select}
        />
      </ModalLayout>
    </Modal>
  );
}

export default CreationModal;
