import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import ConfirmModal from '@/components/ConfirmModal';
import ModalLayout from '@/components/ModalLayout';
import useUiLanguages from '@/hooks/use-ui-languages';
import * as modalStyles from '@/scss/modal.module.scss';

import LanguageDetails from './LanguageDetails';
import LanguageNav from './LanguageNav';
import * as style from './index.module.scss';
import useLanguageEditorContext, { LanguageEditorContext } from './use-language-editor-context';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const LanguageEditorModal = ({ isOpen, onClose }: Props) => {
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
          <LanguageDetails />
        </div>
      </ModalLayout>
      <ConfirmModal
        isOpen={confirmationState !== 'none'}
        cancelButtonText="general.stay_on_page"
        confirmButtonText="general.leave_page"
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

const LanguageEditor = (props: Props) => {
  const { context: languageEditorContext, Provider: LanguageEditorContextProvider } =
    useLanguageEditorContext();

  return (
    <LanguageEditorContextProvider value={languageEditorContext}>
      <LanguageEditorModal {...props} />
    </LanguageEditorContextProvider>
  );
};

export default LanguageEditor;
