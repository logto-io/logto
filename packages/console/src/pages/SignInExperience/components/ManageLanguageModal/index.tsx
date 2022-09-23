import { getDefaultLanguage, LanguageKey } from '@logto/core-kit';
import { languageOptions as uiLanguageOptions } from '@logto/phrases-ui';
import { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import useSWR from 'swr';

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
        onClose={onClose}
      >
        <div className={style.container}>
          <LanguageNav
            languageKeys={allLanguageKeys}
            selectedLanguage={selectedLanguageKey}
            onSelect={setSelectedLanguageKey}
          />
          <LanguageEditor selectedLanguageKey={selectedLanguageKey} />
        </div>
      </ModalLayout>
    </Modal>
  );
};

export default ManageLanguageModal;
