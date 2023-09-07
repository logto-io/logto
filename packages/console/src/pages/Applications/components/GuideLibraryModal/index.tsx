import { useState } from 'react';
import Modal from 'react-modal';

import ModalFooter from '@/components/Guide/ModalFooter';
import ModalHeader from '@/components/Guide/ModalHeader';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as modalStyles from '@/scss/modal.module.scss';

import CreateForm from '../CreateForm';
import GuideLibrary from '../GuideLibrary';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function GuideLibraryModal({ isOpen, onClose }: Props) {
  const { navigate } = useTenantPathname();
  const [showCreateForm, setShowCreateForm] = useState(false);
  return (
    <Modal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.fullScreen}
      onRequestClose={onClose}
    >
      <div className={styles.container}>
        <ModalHeader
          title="applications.guide.modal_header_title"
          subtitle="applications.guide.header_subtitle"
          buttonText="applications.guide.cannot_find_guide"
          requestFormFieldLabel="applications.guide.describe_guide_looking_for"
          requestFormFieldPlaceholder="applications.guide.describe_guide_looking_for_placeholder"
          requestSuccessMessage="applications.guide.request_guide_successfully"
          onClose={onClose}
        />
        <GuideLibrary hasFilters hasCardButton className={styles.content} />
        <ModalFooter
          content="applications.guide.do_not_need_tutorial"
          buttonText="applications.guide.create_without_framework"
          onClick={() => {
            setShowCreateForm(true);
          }}
        />
      </div>
      {showCreateForm && (
        <CreateForm
          onClose={(newApp) => {
            if (newApp) {
              navigate(`/applications/${newApp.id}`);
            }
            setShowCreateForm(false);
          }}
        />
      )}
    </Modal>
  );
}

export default GuideLibraryModal;
