import type { ConnectorFactoryResponse, ConnectorResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import Modal from 'react-modal';
import useSWR from 'swr';

import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import UnnamedTrans from '@/components/UnnamedTrans';
import type { RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

import { getConnectorGroups } from '../../utils';
import Guide from '../Guide';
import PlatformSelector from './PlatformSelector';
import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  type?: ConnectorType;
  onClose?: (connectorId?: string) => void;
};

const CreateForm = ({ onClose, isOpen: isFormOpen, type }: Props) => {
  const { data: existingConnectors, error: connectorsError } = useSWR<
    ConnectorResponse[],
    RequestError
  >('/api/connectors');
  const { data: factories, error: factoriesError } = useSWR<
    ConnectorFactoryResponse[],
    RequestError
  >('/api/connector-factories');
  const isLoading = !factories && !existingConnectors && !connectorsError && !factoriesError;
  const [activeGroupId, setActiveGroupId] = useState<string>();
  const [activeFactoryId, setActiveFactoryId] = useState<string>();
  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);

  const groups = useMemo(() => {
    if (!factories || !existingConnectors) {
      return [];
    }

    const allGroups = getConnectorGroups<ConnectorFactoryResponse>(
      factories.filter(({ type: factoryType }) => factoryType === type)
    );

    return allGroups.map((group) => ({
      ...group,
      connectors: group.connectors.map((connector) => ({
        ...connector,
        added: group.isStandard
          ? false
          : existingConnectors.some(({ connectorId }) => connector.id === connectorId),
      })),
    }));
  }, [factories, type, existingConnectors]);

  const activeGroup = useMemo(
    () => groups.find(({ id }) => id === activeGroupId),
    [activeGroupId, groups]
  );

  const activeFactory = useMemo(
    () => factories?.find(({ id }) => id === activeFactoryId),
    [activeFactoryId, factories]
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

  const handleGroupChange = (groupId: string) => {
    setActiveGroupId(groupId);

    const group = groups.find(({ id }) => id === groupId);

    if (!group) {
      return;
    }

    const firstAvailableConnector = group.connectors.find(({ added }) => !added);

    setActiveFactoryId(firstAvailableConnector?.id);
  };

  const closeModal = () => {
    setIsGetStartedModalOpen(false);
    onClose?.(activeFactoryId);
    setActiveGroupId(undefined);
    setActiveFactoryId(undefined);
  };

  const modalSize = useMemo(() => {
    if (groups.length <= 2) {
      return 'medium';
    }

    if (groups.length === 3) {
      return 'large';
    }

    return 'xlarge';
  }, [groups]);

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
            title="general.next"
            type="primary"
            disabled={!activeFactoryId}
            onClick={() => {
              setIsGetStartedModalOpen(true);
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
          {groups.map(({ id, name, logo, description, connectors }) => {
            const isDisabled = connectors.every(({ added }) => added);

            return (
              <Radio key={id} value={id} isDisabled={isDisabled} disabledLabel="general.added">
                <div className={styles.connector}>
                  <div className={styles.logo}>
                    <img src={logo} alt="logo" />
                  </div>
                  <div className={styles.content}>
                    <div
                      className={classNames(styles.name, isDisabled && styles.nameWithRightPadding)}
                    >
                      <UnnamedTrans resource={name} />
                    </div>
                    <div className={styles.description}>
                      <UnnamedTrans resource={description} />
                    </div>
                  </div>
                </div>
              </Radio>
            );
          })}
        </RadioGroup>
        {activeGroup && (
          <PlatformSelector
            connectorGroup={activeGroup}
            connectorId={activeFactoryId}
            onConnectorIdChange={setActiveFactoryId}
          />
        )}
        {activeFactory && (
          <Modal isOpen={isGetStartedModalOpen} className={modalStyles.fullScreen}>
            <Guide connector={activeFactory} onClose={closeModal} />
          </Modal>
        )}
      </ModalLayout>
    </Modal>
  );
};

export default CreateForm;
