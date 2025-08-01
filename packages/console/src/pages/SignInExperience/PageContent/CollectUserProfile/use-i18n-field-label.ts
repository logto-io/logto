import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { isBuiltInCustomProfileFieldKey, isBuiltInAddressComponentKey } from './utils';

const useI18nFieldLabel = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return useCallback(
    (fieldName: string) => {
      if (isBuiltInCustomProfileFieldKey(fieldName)) {
        if (fieldName === 'address') {
          return t('profile.fields.address.formatted');
        }
        return t(`profile.fields.${fieldName}`);
      }
      if (isBuiltInAddressComponentKey(fieldName)) {
        return t(`profile.fields.address.${fieldName}`);
      }
      return fieldName;
    },
    [t]
  );
};

export default useI18nFieldLabel;
