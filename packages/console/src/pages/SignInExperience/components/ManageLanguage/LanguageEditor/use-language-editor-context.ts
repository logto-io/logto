import { LanguageTag } from '@logto/language-kit';
import { createContext, useMemo, useState } from 'react';

const noop = () => {
  throw new Error('Context provider not found');
};

export type ConfirmationState = 'none' | 'try-close' | 'try-switch-language' | 'try-add-language';

export type Context = {
  selectedLanguage: LanguageTag;
  preSelectedLanguage?: LanguageTag;
  preAddedLanguage?: LanguageTag;
  isDirty: boolean;
  confirmationState: ConfirmationState;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<LanguageTag>>;
  setPreSelectedLanguage: React.Dispatch<React.SetStateAction<LanguageTag | undefined>>;
  setPreAddedLanguage: React.Dispatch<React.SetStateAction<LanguageTag | undefined>>;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  setConfirmationState: React.Dispatch<React.SetStateAction<ConfirmationState>>;
};

export const LanguageEditorContext = createContext<Context>({
  selectedLanguage: 'en',
  preSelectedLanguage: undefined,
  preAddedLanguage: undefined,
  isDirty: false,
  confirmationState: 'none',
  setSelectedLanguage: noop,
  setPreSelectedLanguage: noop,
  setPreAddedLanguage: noop,
  setIsDirty: noop,
  setConfirmationState: noop,
});

const useLanguageEditorContext = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageTag>('en');
  const [preSelectedLanguage, setPreSelectedLanguage] = useState<LanguageTag>();
  const [preAddedLanguage, setPreAddedLanguage] = useState<LanguageTag>();
  const [isDirty, setIsDirty] = useState(false);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>('none');

  const context = useMemo<Context>(
    () => ({
      selectedLanguage,
      preSelectedLanguage,
      preAddedLanguage,
      isDirty,
      confirmationState,
      setSelectedLanguage,
      setPreSelectedLanguage,
      setPreAddedLanguage,
      setIsDirty,
      setConfirmationState,
    }),
    [confirmationState, isDirty, preAddedLanguage, preSelectedLanguage, selectedLanguage]
  );

  return {
    context,
    Provider: LanguageEditorContext.Provider,
  };
};

export default useLanguageEditorContext;
