import type { ConnectorResponse } from '@logto/schemas';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import type { ConnectorFormType } from '@/types/connector';
import { parseFormConfig } from '@/utils/connector-form';
import { safeParseJsonObject } from '@/utils/json';

const useJsonStringConfigParser = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (config: string) => {
    if (!config) {
      toast.error(t('connector_details.save_error_empty_config'));

      return;
    }

    const result = safeParseJsonObject(config);

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
    return formItems
      ? parseFormConfig(data.formConfig, formItems)
      : parseJsonConfig(data.jsonConfig);
  };
};
