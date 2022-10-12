import { LanguageTag } from '@logto/language-kit';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import ConfirmModal from '@/components/ConfirmModal';
import ModalLayout from '@/components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

import { LanguageEditorContext } from '../../hooks/use-language-editor-context';
import LanguageEditor from './LanguageEditor';
import LanguageNav from './LanguageNav';
import * as style from './index.module.scss';

type ManageLanguageModalProps = {
  isOpen: boolean;
  languageTags: LanguageTag[];
  onClose: () => void;
};

const ManageLanguageModal = ({ isOpen, languageTags, onClose }: ManageLanguageModalProps) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    preSelectedLanguage,
    preAddedLanguage,
    isAddingLanguage,
    isDirty,
    confirmationState,
    setSelectedLanguage,
    setPreSelectedLanguage,
    setConfirmationState,
    startAddingLanguage,
    stopAddingLanguage,
  } = useContext(LanguageEditorContext);

  const onCloseModal = () => {
    if (isAddingLanguage || isDirty) {
      setConfirmationState('try-close');

      return;
    }

    onClose();
    setSelectedLanguage(languageTags[0] ?? 'en');
  };

  const onConfirmUnsavedChanges = () => {
    stopAddingLanguage(true);

    if (confirmationState === 'try-close') {
      onClose();
    }

    if (confirmationState === 'try-switch-language' && preSelectedLanguage) {
      setSelectedLanguage(preSelectedLanguage);
      setPreSelectedLanguage(undefined);
    }

    if (confirmationState === 'try-add-language' && preAddedLanguage) {
      startAddingLanguage(preAddedLanguage);
    }

    setConfirmationState('none');
  };

  return (
    <Modal isOpen={isOpen} className={modalStyles.content} overlayClassName={modalStyles.overlay}>
      <ModalLayout
        title="sign_in_exp.others.manage_language.title"
        subtitle="sign_in_exp.others.manage_language.subtitle"
        size="xlarge"
        onClose={onCloseModal}
      >
        <div className={style.container}>
          <LanguageNav />
          <LanguageEditor />
        </div>
      </ModalLayout>
      <ConfirmModal
        isOpen={confirmationState !== 'none'}
        cancelButtonText="general.stay_on_page"
        onCancel={() => {
          setConfirmationState('none');
        }}
        onConfirm={onConfirmUnsavedChanges}
      >
        {t('sign_in_exp.others.manage_language.unsaved_description')}
      </ConfirmModal>
    </Modal>
  );
};

export default ManageLanguageModal;
