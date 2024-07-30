import { useState } from 'react';
import Modal from 'react-modal';

import ModalFooter from '@/components/Guide/ModalFooter';
import ModalHeader from '@/components/Guide/ModalHeader';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import modalStyles from '@/scss/modal.module.scss';

import CreateForm from '../CreateForm';
import GuideLibrary from '../GuideLibrary';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
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
          title="guide.api.modal_title"
          subtitle="guide.api.modal_subtitle"
          buttonText="guide.cannot_find_guide"
          requestFormFieldLabel="guide.describe_guide_looking_for"
          requestFormFieldPlaceholder="guide.api.describe_guide_looking_for_placeholder"
          requestSuccessMessage="guide.request_guide_successfully"
          onClose={onClose}
        />
        <GuideLibrary hasCardButton className={styles.content} />
        <ModalFooter
          content="guide.do_not_need_tutorial"
          buttonText="guide.api.continue_without_tutorial"
          onClick={() => {
            setShowCreateForm(true);
          }}
        />
      </div>
      {showCreateForm && (
        <CreateForm
          onClose={(newApiResource) => {
            if (newApiResource) {
              navigate(`/api-resources/${newApiResource.id}`);
            }
            setShowCreateForm(false);
          }}
        />
      )}
    </Modal>
  );
}

export default GuideLibraryModal;
