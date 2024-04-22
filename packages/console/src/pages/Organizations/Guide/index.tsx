import { useCallback } from 'react';
import Modal from 'react-modal';
import { Outlet } from 'react-router-dom';

import DsModalHeader from '@/ds-components/ModalHeader';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

function Guide() {
  const { navigate } = useTenantPathname();

  const onClose = useCallback(() => {
    navigate('/organizations');
  }, [navigate]);

  return (
    <Modal shouldCloseOnEsc isOpen className={modalStyles.fullScreen} onRequestClose={onClose}>
      <div className={styles.modalContainer}>
        <DsModalHeader
          title="organizations.guide.title"
          subtitle="organizations.guide.subtitle"
          onClose={onClose}
        />
        <Outlet />
      </div>
    </Modal>
  );
}

export default Guide;
