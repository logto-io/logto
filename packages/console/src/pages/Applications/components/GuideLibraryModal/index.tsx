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
          title="guide.app.guide_modal_title"
          subtitle="guide.app.modal_subtitle"
          buttonText="guide.cannot_find_guide"
          requestFormFieldLabel="guide.describe_guide_looking_for"
          requestFormFieldPlaceholder="guide.app.describe_guide_looking_for_placeholder"
          requestSuccessMessage="guide.request_guide_successfully"
          onClose={onClose}
        />
        <GuideLibrary hasCardButton className={styles.content} />
        <ModalFooter
          wrapperClassName={styles.footerInnerWrapper}
          content="guide.do_not_need_tutorial"
          buttonText="guide.app.continue_without_framework"
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
