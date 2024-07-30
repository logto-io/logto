import { type Nullable } from '@silverhand/essentials';
import Modal from 'react-modal';

import { type SelectedGuide } from '@/components/Guide/GuideCard';
import ModalFooter from '@/components/Guide/ModalFooter';
import ModalHeader from '@/components/Guide/ModalHeader';
import modalStyles from '@/scss/modal.module.scss';

import GuideLibrary from '../GuideLibrary';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  /**
   * The callback function when a guide is selected
   * For the parameter:
   * - `undefined`: No guide is selected
   * - `null`: Create application without a framework
   * - `selectedGuide`: The selected guide
   */
  readonly onSelectGuide: (guide?: Nullable<SelectedGuide>) => void;
};

function GuideLibraryModal({ isOpen, onClose, onSelectGuide }: Props) {
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
        <GuideLibrary hasCardButton className={styles.content} onSelectGuide={onSelectGuide} />
        <ModalFooter
          wrapperClassName={styles.footerInnerWrapper}
          content="guide.do_not_need_tutorial"
          buttonText="guide.app.continue_without_framework"
          onClick={() => {
            // Create application without a framework
            onSelectGuide(null);
          }}
        />
      </div>
    </Modal>
  );
}

export default GuideLibraryModal;
