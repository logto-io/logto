import { getDefaultLanguage, LanguageKey } from '@logto/core-kit';
import { languageOptions as uiLanguageOptions } from '@logto/phrases-ui';
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

  const allLanguageKeys = useMemo(() => {
    const uiBuiltInLanguageKeys = uiLanguageOptions.map((option) => option.value);
    const customUiLanguageKeys = customPhraseResponses?.map(({ languageKey }) => languageKey);

    const allKeys = customUiLanguageKeys?.length
      ? [...new Set([...uiBuiltInLanguageKeys, ...customUiLanguageKeys])]
      : uiBuiltInLanguageKeys;

    return allKeys.slice().sort();
  }, [customPhraseResponses]);

  const defaultLanguageKey = getDefaultLanguage(allLanguageKeys[0] ?? '');

  const [selectedLanguageKey, setSelectedLanguageKey] = useState<LanguageKey>(defaultLanguageKey);

  const [isLanguageEditorDirty, setIsLanguageEditorDirty] = useState(false);

  const [isUnsavedAlertOpen, setIsUnsavedAlertOpen] = useState(false);
  const [preselectedLanguageKey, setPreselectedLanguageKey] = useState<LanguageKey>();

  useEffect(() => {
    if (!isOpen) {
      setSelectedLanguageKey(defaultLanguageKey);
    }
  }, [allLanguageKeys, setSelectedLanguageKey, isOpen, defaultLanguageKey]);

  return (
    <Modal isOpen={isOpen} className={modalStyles.content} overlayClassName={modalStyles.overlay}>
      <ModalLayout
        title="sign_in_exp.others.manage_language.title"
        subtitle="sign_in_exp.others.manage_language.subtitle"
        size="xlarge"
        onClose={() => {
          if (isLanguageEditorDirty) {
            setPreselectedLanguageKey(undefined);
            setIsUnsavedAlertOpen(true);

            return;
          }
          onClose();
        }}
      >
        <div className={style.container}>
          <LanguageNav
            languageKeys={allLanguageKeys}
            selectedLanguage={selectedLanguageKey}
            onSelect={(languageKey) => {
              if (isLanguageEditorDirty) {
                setPreselectedLanguageKey(languageKey);
                setIsUnsavedAlertOpen(true);

                return;
              }
              setSelectedLanguageKey(languageKey);
            }}
          />
          <LanguageEditor
            selectedLanguageKey={selectedLanguageKey}
            onEdit={setIsLanguageEditorDirty}
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

          if (preselectedLanguageKey) {
            setSelectedLanguageKey(preselectedLanguageKey);
            setPreselectedLanguageKey(undefined);

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
