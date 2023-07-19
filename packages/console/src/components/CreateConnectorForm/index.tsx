import {
  ConnectorType,
  type ConnectorFactoryResponse,
  type ConnectorResponse,
} from '@logto/schemas';
import { useMemo, useState } from 'react';
import Modal from 'react-modal';
import useSWR from 'swr';

import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import ModalLayout from '@/ds-components/ModalLayout';
import type { RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

import { getConnectorGroups } from '../../pages/Connectors/utils';

import ConnectorRadioGroup from './ConnectorRadioGroup';
import PlatformSelector from './PlatformSelector';
import Skeleton from './Skeleton';
import * as styles from './index.module.scss';
import { compareConnectors, getConnectorRadioGroupSize, getModalTitle } from './utils';

type Props = {
  isOpen: boolean;
  type?: ConnectorType;
  onClose?: (connectorId?: string) => void;
};

function CreateConnectorForm({ onClose, isOpen: isFormOpen, type }: Props) {
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
      .sort(compareConnectors);
  }, [factories, type, existingConnectors]);

  const activeGroup = useMemo(
    () => groups.find(({ id }) => id === activeGroupId),
    [activeGroupId, groups]
  );

  const cardTitle = useMemo(() => getModalTitle(type), [type]);
  const radioGroupSize = useMemo(
    () => getConnectorRadioGroupSize(groups.length, type),
    [groups.length, type]
  );

  const handleGroupChange = (groupId: string) => {
    setActiveGroupId(groupId);

    const group = groups.find(({ id }) => id === groupId);

    if (!group) {
      return;
    }

    const firstAvailableConnector = group.connectors.find(({ added }) => !added);

    setActiveFactoryId(firstAvailableConnector?.id);
  };

  const defaultGroups = useMemo(
    () => (type === ConnectorType.Social ? groups.filter((group) => !group.isStandard) : groups),
    [groups, type]
  );

  const standardGroups = useMemo(() => groups.filter((group) => group.isStandard), [groups]);

  if (!isFormOpen) {
    return null;
  }

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
        size={radioGroupSize}
        onClose={onClose}
      >
        {isLoading && <Skeleton />}
        {factoriesError?.message ?? connectorsError?.message}
        <ConnectorRadioGroup
          name="group"
          groups={defaultGroups}
          value={activeGroupId}
          size={radioGroupSize}
          onChange={handleGroupChange}
        />
        {standardGroups.length > 0 && (
          <>
            <div className={styles.standardLabel}>
              <DynamicT forKey="connectors.standard_connectors" />
            </div>
            <ConnectorRadioGroup
              name="group"
              groups={standardGroups}
              value={activeGroupId}
              size={radioGroupSize}
              onChange={handleGroupChange}
            />
          </>
        )}
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

export default CreateConnectorForm;
