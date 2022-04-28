import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React, { useMemo, useState } from 'react';
import Modal from 'react-modal';
import useSWR from 'swr';

import Button from '@/components/Button';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import ModalLayout from '@/components/ModalLayout';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import UnnamedTrans from '@/components/UnnamedTrans';
import { RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

import GuideModal from '../GuideModal';
import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  type?: ConnectorType;
  onClose?: () => void;
};

const CreateForm = ({ onClose, isOpen: isFormOpen, type }: Props) => {
  const { data, error } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');
  const isLoading = !data && !error;
  const [activeConnectorId, setActiveConnectorId] = useState<string>();
  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);

  const connectors = useMemo(
    () => data?.filter((connector) => connector.metadata.type === type),
    [data, type]
  );

  const activeConnector = useMemo(
    () => connectors?.find(({ id }) => id === activeConnectorId),
    [activeConnectorId, connectors]
  );

  const cardTitle = useMemo(() => {
    if (type === ConnectorType.Email) {
      return 'connectors.setup_title.email';
    }

    if (type === ConnectorType.SMS) {
      return 'connectors.setup_title.sms';
    }

    return 'connectors.setup_title.social';
  }, [type]);

  const closeModal = () => {
    setIsGetStartedModalOpen(false);
    onClose?.();
  };

  return (
    <Modal
      isOpen={isFormOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      <ModalLayout
        title={cardTitle}
        footer={
          <Button
            title="admin_console.connectors.next"
            type="primary"
            disabled={!activeConnectorId}
            onClick={() => {
              setIsGetStartedModalOpen(true);
            }}
          />
        }
        className={styles.body}
        size="large"
        onClose={onClose}
      >
        {isLoading && 'Loading...'}
        {error && error}
        {connectors && (
          <RadioGroup
            name="connector"
            value={activeConnectorId}
            type="card"
            onChange={setActiveConnectorId}
          >
            {connectors.map(({ id, metadata: { name, logo, description } }) => (
              <Radio key={id} value={id} className={styles.connector}>
                <div className={styles.logo}>
                  {logo.startsWith('http') ? <img src={logo} /> : <ImagePlaceholder size={32} />}
                </div>
                <div className={styles.name}>
                  <UnnamedTrans resource={name} />
                </div>
                <div className={styles.connectorId}>{id}</div>
                <div className={styles.description}>
                  <UnnamedTrans resource={description} />
                </div>
              </Radio>
            ))}
          </RadioGroup>
        )}
        {activeConnector && (
          <GuideModal
            connector={activeConnector}
            isOpen={isGetStartedModalOpen}
            onClose={closeModal}
          />
        )}
      </ModalLayout>
    </Modal>
  );
};

export default CreateForm;
