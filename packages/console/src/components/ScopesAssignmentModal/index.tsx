import { type AdminConsoleKey } from '@logto/phrases';
import type React from 'react';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

type ModalTextConfig = {
  title: AdminConsoleKey;
  subtitle: AdminConsoleKey;
  saveBtn: AdminConsoleKey;
};

type Props = {
  isOpen: boolean;
  modalText: ModalTextConfig;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitDisabled?: boolean;
  isLoading?: boolean;
  tabElement?: React.ReactNode;
  children?: React.ReactNode;
};

function ScopesAssignmentModal({
  isOpen,
  modalText,
  onClose,
  children,
  onSubmit,
  isSubmitDisabled,
  isLoading = false,
  tabElement,
}: Props) {
  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title={modalText.title}
        subtitle={modalText.subtitle}
        size="large"
        footer={
          <Button
            isLoading={isLoading}
            disabled={isSubmitDisabled}
            htmlType="submit"
            title={modalText.saveBtn}
            size="large"
            type="primary"
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        {tabElement}
        <FormField title="application_details.permissions.permissions_assignment_form_title">
          {children}
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default ScopesAssignmentModal;
