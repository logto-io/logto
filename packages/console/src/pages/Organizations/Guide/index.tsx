import { useCallback } from 'react';
import Modal from 'react-modal';
import { Navigate, Route, Routes } from 'react-router-dom';

import DsModalHeader from '@/ds-components/ModalHeader';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as modalStyles from '@/scss/modal.module.scss';

import CreateOrganization from './CreateOrganization';
import CreateRoles from './CreateRoles';
import IntroductionAndPermissions from './IntroductionAndPermissions';
import { steps } from './const';
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
        <Routes>
          <Route index element={<Navigate replace to={steps.createPermissions} />} />
          <Route path={steps.createPermissions} element={<IntroductionAndPermissions />} />
          <Route path={steps.createRoles} element={<CreateRoles />} />
          <Route path={steps.createOrganization} element={<CreateOrganization />} />
        </Routes>
      </div>
    </Modal>
  );
}

export default Guide;
