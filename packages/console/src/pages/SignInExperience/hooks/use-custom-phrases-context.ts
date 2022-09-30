import { LanguageTag } from '@logto/language-kit';
import { builtInLanguages as builtInUiLanguages } from '@logto/phrases-ui';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { RequestError } from '@/hooks/use-api';

import { CustomPhraseResponse } from '../types';

const noop = () => {
  throw new Error('Context provider not found');
};

export type ConfirmationState = 'none' | 'try-close' | 'try-switch-language' | 'try-add-language';

export type Context = {
  displayingLanguages: LanguageTag[];
  selectedLanguageTag: LanguageTag;
  preSelectedLanguageTag: LanguageTag | undefined;
  preAddedLanguageTag: LanguageTag | undefined;
  isAddingLanguage: boolean;
  isCurrentCustomPhraseDirty: boolean;
  confirmationState: ConfirmationState;
  setSelectedLanguageTag: React.Dispatch<React.SetStateAction<LanguageTag>>;
  resetSelectedLanguageTag: () => void;
  setPreSelectedLanguageTag: React.Dispatch<React.SetStateAction<LanguageTag | undefined>>;
  setPreAddedLanguageTag: React.Dispatch<React.SetStateAction<LanguageTag | undefined>>;
  setIsCurrentCustomPhraseDirty: React.Dispatch<React.SetStateAction<boolean>>;
  appendToCustomPhraseList: (customPhrase: CustomPhraseResponse) => void;
  setConfirmationState: React.Dispatch<React.SetStateAction<ConfirmationState>>;
  startAddingLanguage: (languageTag: LanguageTag) => void;
  stopAddingLanguage: (isCanceled?: boolean) => void;
};

export const CustomPhrasesContext = createContext<Context>({
  displayingLanguages: [],
  selectedLanguageTag: 'en',
  preSelectedLanguageTag: undefined,
  preAddedLanguageTag: undefined,
  isAddingLanguage: false,
  isCurrentCustomPhraseDirty: false,
  confirmationState: 'none',
  setSelectedLanguageTag: noop,
  resetSelectedLanguageTag: noop,
  setPreSelectedLanguageTag: noop,
  setPreAddedLanguageTag: noop,
  setIsCurrentCustomPhraseDirty: noop,
  appendToCustomPhraseList: noop,
  setConfirmationState: noop,
  startAddingLanguage: noop,
  stopAddingLanguage: noop,
});

const useCustomPhrasesContext = () => {
  const { data: customPhraseList, mutate: mutateCustomPhraseList } = useSWR<
    CustomPhraseResponse[],
    RequestError
  >('/api/custom-phrases');

  const existedLanguageTags = useMemo(
    () =>
      [
        ...new Set([
          ...builtInUiLanguages,
          ...(customPhraseList?.map(({ languageTag }) => languageTag) ?? []),
        ]),
      ]
        .slice()
        .sort(),
    [customPhraseList]
  );

  const [displayingLanguages, setDisplayingLanguages] =
    useState<LanguageTag[]>(existedLanguageTags);

  useEffect(() => {
    setDisplayingLanguages(existedLanguageTags);
  }, [existedLanguageTags]);

  const defaultLanguageTag = useMemo(() => existedLanguageTags[0] ?? 'en', [existedLanguageTags]);
  const [selectedLanguageTag, setSelectedLanguageTag] = useState<LanguageTag>(defaultLanguageTag);
  const [preSelectedLanguageTag, setPreSelectedLanguageTag] = useState<LanguageTag>();
  const [preAddedLanguageTag, setPreAddedLanguageTag] = useState<LanguageTag>();
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [isCurrentCustomPhraseDirty, setIsCurrentCustomPhraseDirty] = useState(false);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>('none');

  const appendToCustomPhraseList = useCallback(
    (customPhrase: CustomPhraseResponse) => {
      void mutateCustomPhraseList([
        customPhrase,
        ...(customPhraseList?.filter(
          ({ languageTag }) => languageTag !== customPhrase.languageTag
        ) ?? []),
      ]);
    },
    [customPhraseList, mutateCustomPhraseList]
  );

  const startAddingLanguage = useCallback(
    (languageTag: LanguageTag) => {
      setDisplayingLanguages([...new Set([languageTag, ...existedLanguageTags])].slice().sort());
      setSelectedLanguageTag(languageTag);
      setIsAddingLanguage(true);
    },
    [existedLanguageTags]
  );

  const stopAddingLanguage = useCallback(
    (isCanceled = false) => {
      if (isAddingLanguage) {
        if (isCanceled) {
          setDisplayingLanguages(existedLanguageTags);
        }

        setIsAddingLanguage(false);
      }
    },
    [existedLanguageTags, isAddingLanguage]
  );

  const resetSelectedLanguageTag = useCallback(() => {
    setSelectedLanguageTag(defaultLanguageTag);
  }, [defaultLanguageTag]);

  const context = useMemo<Context>(() => {
    return {
      displayingLanguages,
      selectedLanguageTag,
      preSelectedLanguageTag,
      preAddedLanguageTag,
      isAddingLanguage,
      isCurrentCustomPhraseDirty,
      confirmationState,
      setSelectedLanguageTag,
      resetSelectedLanguageTag,
      setPreSelectedLanguageTag,
      setPreAddedLanguageTag,
      setIsCurrentCustomPhraseDirty,
      appendToCustomPhraseList,
      setConfirmationState,
      startAddingLanguage,
      stopAddingLanguage,
    };
  }, [
    displayingLanguages,
    selectedLanguageTag,
    preSelectedLanguageTag,
    preAddedLanguageTag,
    isAddingLanguage,
    isCurrentCustomPhraseDirty,
    confirmationState,
    resetSelectedLanguageTag,
    appendToCustomPhraseList,
    startAddingLanguage,
    stopAddingLanguage,
  ]);

  return {
    context,
    Provider: CustomPhrasesContext.Provider,
  };
};

export default useCustomPhrasesContext;
