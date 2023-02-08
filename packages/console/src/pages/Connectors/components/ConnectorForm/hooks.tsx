import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { safeParseJson } from '@/utilities/json';

export const useConfigParser = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (config: string) => {
    if (!config) {
      toast.error(t('connector_details.save_error_empty_config'));

      return;
    }

    const result = safeParseJson(config);

    if (!result.success) {
      toast.error(result.error);

      return;
    }

    return result;
  };
};
