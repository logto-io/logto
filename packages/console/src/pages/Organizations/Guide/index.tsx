import { useCallback } from 'react';
import Modal from 'react-modal';
import { Navigate, Route, Routes } from 'react-router-dom';

import DsModalHeader from '@/ds-components/ModalHeader';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as modalStyles from '@/scss/modal.module.scss';

import Introduction from './Introduction';
import OrganizationInfo from './OrganizationInfo';
import OrganizationPermissions from './OrganizationPermissions';
import OrganizationRoles from './OrganizationRoles';
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
          <Route index element={<Navigate replace to={steps.introduction} />} />
          <Route path={steps.introduction} element={<Introduction />} />
          <Route path={steps.permissions} element={<OrganizationPermissions />} />
          <Route path={steps.roles} element={<OrganizationRoles />} />
          <Route path={steps.organizationInfo} element={<OrganizationInfo />} />
        </Routes>
      </div>
    </Modal>
  );
}

export default Guide;
