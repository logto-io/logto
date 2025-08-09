import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as s from 'superstruct';

import { extraProfileFieldNamesGuard } from '@/types/guard';

const useFieldLabel = () => {
  const { t } = useTranslation();

  const getFieldLabel = useCallback(
    (fieldName: string, label = '') => {
      try {
        s.assert(fieldName, extraProfileFieldNamesGuard);
        return label || t(`profile.${fieldName}`);
      } catch {
        return label;
      }
    },
    [t]
  );

  return getFieldLabel;
};

export default useFieldLabel;
