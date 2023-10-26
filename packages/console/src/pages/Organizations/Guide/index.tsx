import { useCallback, useState } from 'react';
import Modal from 'react-modal';

import ActionBar from '@/components/ActionBar';
import Button from '@/ds-components/Button';
import DsModalHeader from '@/ds-components/ModalHeader';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as modalStyles from '@/scss/modal.module.scss';

import Step1 from './Step1';
import * as styles from './index.module.scss';

const totalSteps = 3;

function Guide() {
  const { navigate } = useTenantPathname();
  const [currentStep, setCurrentStep] = useState(1);

  const onClose = useCallback(() => {
    navigate('/organizations');
  }, [navigate]);

  const onClickNext = useCallback(() => {
    setCurrentStep(Math.min(currentStep + 1, totalSteps));
  }, [currentStep]);

  const onClickBack = useCallback(() => {
    setCurrentStep(Math.max(1, currentStep - 1));
  }, [currentStep]);

  return (
    <Modal shouldCloseOnEsc isOpen className={modalStyles.fullScreen} onRequestClose={onClose}>
      <div className={styles.modalContainer}>
        <DsModalHeader
          title="organizations.guide.title"
          subtitle="organizations.guide.subtitle"
          onClose={onClose}
        />
        <OverlayScrollbar className={styles.content}>
          {currentStep === 1 && <Step1 />}
        </OverlayScrollbar>
        <ActionBar step={currentStep} totalSteps={totalSteps}>
          {currentStep === totalSteps && (
            <Button title="general.done" type="primary" onClick={onClose} />
          )}
          {currentStep < totalSteps && (
            <Button title="general.next" type="primary" onClick={onClickNext} />
          )}
          {currentStep > 1 && <Button title="general.back" onClick={onClickBack} />}
        </ActionBar>
      </div>
    </Modal>
  );
}

export default Guide;
