import type { LanguageTag } from '@logto/language-kit';
import { builtInLanguages as builtInUiLanguages } from '@logto/phrases-ui';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import type { CustomPhraseResponse } from '@/types/custom-phrase';

import type { RequestError } from './use-api';
import useApi from './use-api';

const useUiLanguages = () => {
  const {
    data: customPhraseList,
    error,
    mutate,
  } = useSWR<CustomPhraseResponse[], RequestError>('/api/custom-phrases');

  const languages = useMemo(
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

  const api = useApi();

  const addLanguage = useCallback(
    async (languageTag: LanguageTag) => {
      await api.put(`/api/custom-phrases/${languageTag}`, { json: {} });
      await mutate();
    },
    [api, mutate]
  );

  return {
    customPhrases: customPhraseList,
    languages,
    error,
    isLoading: !customPhraseList && !error,
    addLanguage,
    mutate,
  };
};

export default useUiLanguages;
