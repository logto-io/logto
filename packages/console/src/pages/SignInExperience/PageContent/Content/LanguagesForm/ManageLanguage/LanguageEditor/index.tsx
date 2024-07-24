import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import Close from '@/assets/icons/close.svg?react';
import Card from '@/ds-components/Card';
import CardTitle from '@/ds-components/CardTitle';
import ConfirmModal from '@/ds-components/ConfirmModal';
import IconButton from '@/ds-components/IconButton';
import useUiLanguages from '@/hooks/use-ui-languages';

import LanguageDetails from './LanguageDetails';
import LanguageNav from './LanguageNav';
import styles from './index.module.scss';
import useLanguageEditorContext, { LanguageEditorContext } from './use-language-editor-context';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

function LanguageEditorModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { languages, addLanguage } = useUiLanguages();

  const defaultSelectedLanguage = languages[0] ?? 'en';

  const {
    preSelectedLanguage,
    preAddedLanguage,
    isDirty,
    confirmationState,
    setSelectedLanguage,
    setPreSelectedLanguage,
    setPreAddedLanguage,
    setConfirmationState,
    setIsDirty,
  } = useContext(LanguageEditorContext);

  useEffect(() => {
    setSelectedLanguage(defaultSelectedLanguage);
  }, [defaultSelectedLanguage, setSelectedLanguage]);

  const onCloseModal = () => {
    if (isDirty) {
      setConfirmationState('try-close');

      return;
    }

    onClose();
    setSelectedLanguage(languages[0] ?? 'en');
  };

  const onConfirmUnsavedChanges = async () => {
    if (confirmationState === 'try-close') {
      onClose();
    }

    if (confirmationState === 'try-switch-language' && preSelectedLanguage) {
      setSelectedLanguage(preSelectedLanguage);
      setPreSelectedLanguage(undefined);
    }

    if (confirmationState === 'try-add-language' && preAddedLanguage) {
      await addLanguage(preAddedLanguage);
      setSelectedLanguage(preAddedLanguage);
      setPreAddedLanguage(undefined);
    }

    setConfirmationState('none');
    setIsDirty(false);
  };

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      onRequestClose={onCloseModal}
    >
      <Card className={styles.editor}>
        <div className={styles.header}>
          <CardTitle
            title="sign_in_exp.content.manage_language.title"
            subtitle="sign_in_exp.content.manage_language.subtitle"
          />
          <IconButton onClick={onCloseModal}>
            <Close />
          </IconButton>
        </div>
        <div className={styles.content}>
          <LanguageNav />
          <LanguageDetails />
        </div>
      </Card>
      <ConfirmModal
        isOpen={confirmationState !== 'none'}
        cancelButtonText="general.stay_on_page"
        confirmButtonText="general.leave_page"
        onCancel={() => {
          setConfirmationState('none');
        }}
        onConfirm={onConfirmUnsavedChanges}
      >
        {t('sign_in_exp.content.manage_language.unsaved_description')}
      </ConfirmModal>
    </Modal>
  );
}

function LanguageEditor(props: Props) {
  const { context: languageEditorContext, Provider: LanguageEditorContextProvider } =
    useLanguageEditorContext();

  return (
    <LanguageEditorContextProvider value={languageEditorContext}>
      <LanguageEditorModal {...props} />
    </LanguageEditorContextProvider>
  );
}

export default LanguageEditor;
