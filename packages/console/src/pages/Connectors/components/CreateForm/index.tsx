import type { ConnectorFactoryResponse, ConnectorResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import Modal from 'react-modal';
import useSWR from 'swr';

import Button from '@/components/Button';
import ConnectorLogo from '@/components/ConnectorLogo';
import ModalLayout from '@/components/ModalLayout';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import UnnamedTrans from '@/components/UnnamedTrans';
import type { RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

import PlatformSelector from './PlatformSelector';
import * as styles from './index.module.scss';
import { getConnectorOrder } from './utils';
import { getConnectorGroups } from '../../utils';

type Props = {
  isOpen: boolean;
  type?: ConnectorType;
  onClose?: (connectorId?: string) => void;
};

function CreateForm({ onClose, isOpen: isFormOpen, type }: Props) {
  const { data: existingConnectors, error: connectorsError } = useSWR<
    ConnectorResponse[],
    RequestError
  >('api/connectors');
  const { data: factories, error: factoriesError } = useSWR<
    ConnectorFactoryResponse[],
    RequestError
  >('api/connector-factories');
  const isLoading = !factories && !existingConnectors && !connectorsError && !factoriesError;
  const [activeGroupId, setActiveGroupId] = useState<string>();
  const [activeFactoryId, setActiveFactoryId] = useState<string>();

  const groups = useMemo(() => {
    if (!factories || !existingConnectors) {
      return [];
    }

    const allGroups = getConnectorGroups<ConnectorFactoryResponse>(
      factories.filter(({ type: factoryType, isDemo }) => factoryType === type && !isDemo)
    );

    return allGroups
      .map((group) => ({
        ...group,
        connectors: group.connectors.map((connector) => ({
          ...connector,
          added:
            !group.isStandard &&
            existingConnectors.some(({ connectorId }) => connector.id === connectorId),
        })),
      }))
      .filter(({ connectors }) => !connectors.every(({ added }) => added))
      .slice()
      .sort((connectorA, connectorB) => {
        const orderA = getConnectorOrder(connectorA.target, connectorA.isStandard);
        const orderB = getConnectorOrder(connectorB.target, connectorB.isStandard);

        return orderA - orderB;
      });
  }, [factories, type, existingConnectors]);

  const activeGroup = useMemo(
    () => groups.find(({ id }) => id === activeGroupId),
    [activeGroupId, groups]
  );

  const cardTitle = useMemo(() => {
    if (type === ConnectorType.Email) {
      return 'connectors.setup_title.email';
    }

    if (type === ConnectorType.Sms) {
      return 'connectors.setup_title.sms';
    }

    return 'connectors.setup_title.social';
  }, [type]);

  const modalSize = useMemo(() => {
    if (groups.length <= 2) {
      return 'medium';
    }

    if (groups.length === 3) {
      return 'large';
    }

    return 'xlarge';
  }, [groups.length]);

  if (!isFormOpen) {
    return null;
  }

  const handleGroupChange = (groupId: string) => {
    setActiveGroupId(groupId);

    const group = groups.find(({ id }) => id === groupId);

    if (!group) {
      return;
    }

    const firstAvailableConnector = group.connectors.find(({ added }) => !added);

    setActiveFactoryId(firstAvailableConnector?.id);
  };

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={isFormOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose?.();
      }}
    >
      <ModalLayout
        title={cardTitle}
        footer={
          <Button
            title="general.next"
            type="primary"
            disabled={!activeFactoryId}
            onClick={() => {
              onClose?.(activeFactoryId);
            }}
          />
        }
        className={styles.body}
        size={modalSize}
        onClose={onClose}
      >
        {isLoading && 'Loading...'}
        {factoriesError?.message ?? connectorsError?.message}
        <RadioGroup
          name="group"
          value={activeGroupId}
          type="card"
          className={classNames(styles.connectorGroup, styles[modalSize])}
          onChange={handleGroupChange}
        >
          {groups.map(({ id, name, logo, logoDark, description }) => (
            <Radio key={id} value={id}>
              <div className={styles.connector}>
                <ConnectorLogo data={{ logo, logoDark }} />
                <div className={styles.content}>
                  <div className={classNames(styles.name)}>
                    <UnnamedTrans resource={name} />
                  </div>
                  <div className={styles.description}>
                    <UnnamedTrans resource={description} />
                  </div>
                </div>
              </div>
            </Radio>
          ))}
        </RadioGroup>
        {activeGroup && (
          <PlatformSelector
            connectorGroup={activeGroup}
            connectorId={activeFactoryId}
            onConnectorIdChange={setActiveFactoryId}
          />
        )}
      </ModalLayout>
    </Modal>
  );
}

export default CreateForm;
