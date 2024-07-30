import { useState, useCallback, useLayoutEffect } from 'react';
import ReactModal from 'react-modal';

import usePlatform from '@/hooks/use-platform';

import OrganizationItem from '../OrganizationItem';
import { type Organization } from '../OrganizationItem';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly parentElementRef: React.RefObject<HTMLDivElement>;
  readonly organizations: Organization[];
  readonly selectedOrganization: Organization;
  readonly onSelect: (organization: Organization) => void;
  readonly onClose: () => void;
};

const OrganizationSelectorModal = ({
  isOpen,
  parentElementRef,
  organizations,
  selectedOrganization,
  onSelect,
  onClose,
}: Props) => {
  const { isMobile } = usePlatform();
  const [position, setPosition] = useState({});

  const updatePosition = useCallback(() => {
    const parent = parentElementRef.current;

    if (!parent || isMobile || !isOpen) {
      setPosition({});
      return;
    }

    const { top, left, height, width } = parent.getBoundingClientRect();

    // Offset the modal from the parent element
    const offset = 8;

    // The height of each organization item
    const organizationItemHeight = 40;
    // The padding around the modal content
    const organizationModalPadding = 8;

    // Calculate the max top position so that the modal doesn't go off the screen
    const modalContentHeight =
      organizations.length * organizationItemHeight + organizationModalPadding * 2;
    const windowHeight = window.innerHeight;
    const maxTop = windowHeight - modalContentHeight;

    setPosition({ top: Math.min(top + height + offset, maxTop), left, width });
  }, [isMobile, isOpen, organizations.length, parentElementRef]);

  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition, isOpen]);

  return (
    <ReactModal
      isOpen={isOpen}
      overlayClassName={styles.dropdownOverlay}
      className={styles.dropdownModal}
      style={{
        content: {
          ...position,
        },
      }}
      closeTimeoutMS={isMobile ? 300 : 0}
      onRequestClose={onClose}
    >
      <div className={styles.container}>
        {organizations.map((organization) => (
          <OrganizationItem
            key={organization.id}
            className={styles.organizationItem}
            organization={organization}
            isSelected={organization.id === selectedOrganization.id}
            onSelect={() => {
              onClose();
              onSelect(organization);
            }}
          />
        ))}
      </div>
    </ReactModal>
  );
};

export default OrganizationSelectorModal;
