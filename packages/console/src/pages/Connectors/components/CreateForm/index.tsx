import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React, { useEffect, useMemo, useState } from 'react';
import ReactModal from 'react-modal';
import useSWR from 'swr';

import Button from '@/components/Button';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import ModalLayout from '@/components/ModalLayout';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import UnnamedTrans from '@/components/UnnamedTrans';
import { RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  type?: ConnectorType;
};

const CreateForm = ({ isOpen, onClose, type }: Props) => {
  const [connectorId, setConnectorId] = useState<string>('');
  const { data, error } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');
  const isLoading = !data && !error;

  useEffect(() => {
    if (isOpen) {
      setConnectorId('');
    }
  }, [isOpen]);

  const cardTitle = useMemo(() => {
    if (type === ConnectorType.Email) {
      return 'connectors.setup_title.email';
    }

    if (type === ConnectorType.SMS) {
      return 'connectors.setup_title.sms';
    }

    return 'connectors.setup_title.social';
  }, [type]);

  const connectors = useMemo(
    () => data?.filter((connector) => connector.metadata.type === type),
    [data, type]
  );

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      <ModalLayout
        title={cardTitle}
        footer={
          <Button
            title="admin_console.connectors.next"
            type="primary"
            disabled={!connectorId}
            onClick={() => {
              console.log("Charles's job.");
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
            value={connectorId}
            onChange={(value) => {
              setConnectorId(value);
            }}
          >
            {connectors.map((connector) => (
              <Radio key={connector.id} value={connector.id} className={styles.connector}>
                <div className={styles.logo}>
                  {connector.metadata.logo.startsWith('http') ? (
                    <img src={connector.metadata.logo} />
                  ) : (
                    <ImagePlaceholder size={32} />
                  )}
                </div>
                <div className={styles.name}>
                  <UnnamedTrans resource={connector.metadata.name} />{' '}
                </div>
                <div className={styles.connectorId}>{connector.id}</div>
                <div className={styles.description}>
                  <UnnamedTrans resource={connector.metadata.description} />
                </div>
              </Radio>
            ))}
          </RadioGroup>
        )}
      </ModalLayout>
    </ReactModal>
  );
};

export default CreateForm;
