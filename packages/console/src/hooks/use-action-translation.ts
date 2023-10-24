import { type AdminConsoleKey } from '@logto/phrases';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const decapitalize = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

/**
 * Returns a function that translates a given action and target into a short phrase.
 */
const useActionTranslation = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return useCallback(
    (action: 'edit' | 'create' | 'delete', target: AdminConsoleKey) =>
      t(`general.${action}_field`, { field: decapitalize(String(t(target))) }),
    [t]
  );
};

export default useActionTranslation;
