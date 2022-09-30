import { builtInLanguages as builtInUiLanguages } from '@logto/phrases-ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { CustomPhraseResponse } from '@/types/custom-phrase';

import { RequestError } from './use-api';

const useUiLanguages = () => {
  const {
    data: customPhraseList,
    error,
    mutate,
  } = useSWR<CustomPhraseResponse[], RequestError>('/api/custom-phrases');

  const isLoading = useMemo(() => !customPhraseList && !error, [customPhraseList, error]);

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

  return {
    languages,
    error,
    isLoading,
    mutate,
  };
};

export default useUiLanguages;
