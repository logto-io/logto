import { LanguageTag } from '@logto/language-kit';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const noop = () => {
  throw new Error('Context provider not found');
};

export type ConfirmationState = 'none' | 'try-close' | 'try-switch-language' | 'try-add-language';

export type Context = {
  languages: LanguageTag[];
  selectedLanguage: LanguageTag;
  preSelectedLanguage?: LanguageTag;
  preAddedLanguage?: LanguageTag;
  isAddingLanguage: boolean;
  isDirty: boolean;
  confirmationState: ConfirmationState;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<LanguageTag>>;
  setPreSelectedLanguage: React.Dispatch<React.SetStateAction<LanguageTag | undefined>>;
  setPreAddedLanguage: React.Dispatch<React.SetStateAction<LanguageTag | undefined>>;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  setConfirmationState: React.Dispatch<React.SetStateAction<ConfirmationState>>;
  startAddingLanguage: (languageTag: LanguageTag) => void;
  stopAddingLanguage: (isCanceled?: boolean) => void;
};

export const LanguageEditorContext = createContext<Context>({
  languages: [],
  selectedLanguage: 'en',
  preSelectedLanguage: undefined,
  preAddedLanguage: undefined,
  isAddingLanguage: false,
  isDirty: false,
  confirmationState: 'none',
  setSelectedLanguage: noop,
  setPreSelectedLanguage: noop,
  setPreAddedLanguage: noop,
  setIsDirty: noop,
  setConfirmationState: noop,
  startAddingLanguage: noop,
  stopAddingLanguage: noop,
});

const useLanguageEditorContext = (defaultLanguages: LanguageTag[]) => {
  const [languages, setLanguages] = useState(defaultLanguages);

  useEffect(() => {
    setLanguages(defaultLanguages);
  }, [defaultLanguages]);

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageTag>(languages[0] ?? 'en');
  const [preSelectedLanguage, setPreSelectedLanguage] = useState<LanguageTag>();
  const [preAddedLanguage, setPreAddedLanguage] = useState<LanguageTag>();
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>('none');

  const startAddingLanguage = useCallback(
    (language: LanguageTag) => {
      setLanguages([...new Set([language, ...defaultLanguages])].slice().sort());
      setSelectedLanguage(language);
      setIsAddingLanguage(true);
    },
    [defaultLanguages]
  );

  const stopAddingLanguage = useCallback(
    (isCanceled = false) => {
      if (isAddingLanguage) {
        if (isCanceled) {
          setLanguages(defaultLanguages);
          setSelectedLanguage(languages[0] ?? 'en');
        }
        setIsAddingLanguage(false);
      }
    },
    [defaultLanguages, isAddingLanguage, languages]
  );

  const context = useMemo<Context>(
    () => ({
      languages,
      selectedLanguage,
      preSelectedLanguage,
      preAddedLanguage,
      isAddingLanguage,
      isDirty,
      confirmationState,
      setSelectedLanguage,
      setPreSelectedLanguage,
      setPreAddedLanguage,
      setIsDirty,
      setConfirmationState,
      startAddingLanguage,
      stopAddingLanguage,
    }),
    [
      confirmationState,
      isAddingLanguage,
      isDirty,
      languages,
      preAddedLanguage,
      preSelectedLanguage,
      selectedLanguage,
      startAddingLanguage,
      stopAddingLanguage,
    ]
  );

  return {
    context,
    Provider: LanguageEditorContext.Provider,
  };
};

export default useLanguageEditorContext;
