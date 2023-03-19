import type { ConnectorResponse } from '@logto/schemas';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { parseFormConfig } from '@/pages/Connectors/components/ConnectorForm/utils';
import type { ConnectorFormType } from '@/pages/Connectors/types';
import { safeParseJson } from '@/utils/json';

export const useJsonStringConfigParser = () => {
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

    return result.data;
  };
};

export const useConnectorFormConfigParser = () => {
  const parseJsonConfig = useJsonStringConfigParser();

  return (data: ConnectorFormType, formItems: ConnectorResponse['formItems']) => {
    return formItems ? parseFormConfig(data, formItems) : parseJsonConfig(data.config);
  };
};
