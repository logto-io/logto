import { useState, useCallback, useLayoutEffect } from 'react';
import ReactModal from 'react-modal';

import usePlatform from '@/hooks/use-platform';

import OrganizationItem from '../OrganizationItem';
import { type Organization } from '../OrganizationItem';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  parentElementRef: React.RefObject<HTMLDivElement>;
  organizations: Organization[];
  selectedOrganization: Organization;
  onSelect: (organization: Organization) => void;
  onClose: () => void;
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

    if (!parent || isMobile) {
      setPosition({});
      return;
    }

    const offset = 8;
    const { top, left, height, width } = parent.getBoundingClientRect();
    setPosition({ top: top + height + offset, left, width });
  }, [isMobile, parentElementRef]);

  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);

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
      {organizations.map((organization) => (
        <OrganizationItem
          key={organization.id}
          organization={organization}
          isSelected={organization.id === selectedOrganization.id}
          onSelect={() => {
            onClose();
            onSelect(organization);
          }}
        />
      ))}
    </ReactModal>
  );
};

export default OrganizationSelectorModal;
