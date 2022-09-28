import { LanguageTag } from '@logto/language-kit';
import { builtInLanguages as builtInUiLanguages, getDefaultLanguageTag } from '@logto/phrases-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWR from 'swr';

import ConfirmModal from '@/components/ConfirmModal';
import ModalLayout from '@/components/ModalLayout';
import { RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

import LanguageEditor from './LanguageEditor';
import LanguageNav from './LanguageNav';
import * as style from './index.module.scss';
import { CustomPhraseResponse } from './types';

type ManageLanguageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ManageLanguageModal = ({ isOpen, onClose }: ManageLanguageModalProps) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: customPhraseResponses } = useSWR<CustomPhraseResponse[], RequestError>(
    '/api/custom-phrases'
  );

  const allLanguageTags = useMemo(() => {
    const customUiLanguageTags = customPhraseResponses?.map(({ languageKey }) => languageKey);

    const allTags = customUiLanguageTags?.length
      ? [...new Set([...builtInUiLanguages, ...customUiLanguageTags])]
      : builtInUiLanguages;

    return allTags.slice().sort();
  }, [customPhraseResponses]);

  const defaultLanguageTag = getDefaultLanguageTag(allLanguageTags[0] ?? '');

  const [selectedLanguageTag, setSelectedLanguageTag] = useState<LanguageTag>(defaultLanguageTag);

  const [isLanguageEditorDirty, setIsLanguageEditorDirty] = useState(false);

  const [isUnsavedAlertOpen, setIsUnsavedAlertOpen] = useState(false);
  const [preselectedLanguageTag, setPreselectedLanguageTag] = useState<LanguageTag>();

  useEffect(() => {
    if (!isOpen) {
      setSelectedLanguageTag(defaultLanguageTag);
    }
  }, [allLanguageTags, setSelectedLanguageTag, isOpen, defaultLanguageTag]);

  return (
    <Modal isOpen={isOpen} className={modalStyles.content} overlayClassName={modalStyles.overlay}>
      <ModalLayout
        title="sign_in_exp.others.manage_language.title"
        subtitle="sign_in_exp.others.manage_language.subtitle"
        size="xlarge"
        onClose={() => {
          if (isLanguageEditorDirty) {
            setPreselectedLanguageTag(undefined);
            setIsUnsavedAlertOpen(true);

            return;
          }
          onClose();
        }}
      >
        <div className={style.container}>
          <LanguageNav
            languageTags={allLanguageTags}
            selectedLanguageTag={selectedLanguageTag}
            onSelect={(languageTag) => {
              if (isLanguageEditorDirty) {
                setPreselectedLanguageTag(languageTag);
                setIsUnsavedAlertOpen(true);

                return;
              }
              setSelectedLanguageTag(languageTag);
            }}
          />
          <LanguageEditor
            selectedLanguageTag={selectedLanguageTag}
            onFormStateChange={setIsLanguageEditorDirty}
          />
        </div>
      </ModalLayout>
      <ConfirmModal
        isOpen={isUnsavedAlertOpen}
        cancelButtonText="general.stay_on_page"
        onCancel={() => {
          setIsUnsavedAlertOpen(false);
        }}
        onConfirm={() => {
          setIsUnsavedAlertOpen(false);

          if (preselectedLanguageTag) {
            setSelectedLanguageTag(preselectedLanguageTag);
            setPreselectedLanguageTag(undefined);

            return;
          }

          onClose();
        }}
      >
        {t('sign_in_exp.others.manage_language.unsaved_description')}
      </ConfirmModal>
    </Modal>
  );
};

export default ManageLanguageModal;
