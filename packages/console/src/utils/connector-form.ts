import type { ConnectorConfigFormItem } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorType } from '@logto/connector-kit';
import { type ConnectorFactoryResponse, type ConnectorResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { SyncProfileMode, type ConnectorFormType } from '@/types/connector';
import { safeParseJson } from '@/utils/json';

const initFormData = (formItems: ConnectorConfigFormItem[], config?: Record<string, unknown>) => {
  const data: Array<[string, unknown]> = formItems.map((item) => {
    const value = config?.[item.key] ?? item.defaultValue;

    if (item.type === ConnectorConfigFormItemType.Json) {
      return [item.key, JSON.stringify(value, null, 2)];
    }

    return [item.key, value];
  });

  return Object.fromEntries(data);
};

export const parseFormConfig = (
  config: Record<string, unknown>,
  formItems: ConnectorConfigFormItem[]
) => {
  return Object.fromEntries(
    Object.entries(config)
      .map(([key, value]) => {
        // Filter out empty input
        if (value === '') {
          return null;
        }

        const formItem = formItems.find((item) => item.key === key);

        if (!formItem) {
          return null;
        }

        if (formItem.type === ConnectorConfigFormItemType.Number) {
          /**
           * When set ReactHookForm valueAsNumber to true, the number input field
           * will return number value. If the input can not be properly converted
           * to number value, it will return NaN instead.
           */
          // The number input my return string value.
          return Number.isNaN(value) ? null : [key, Number(value)];
        }

        if (formItem.type === ConnectorConfigFormItemType.Json) {
          // The JSON validation is done in the form
          const result = safeParseJson(typeof value === 'string' ? value : '');

          return [key, result.success ? result.data : {}];
        }

        return [key, value];
      })
      .filter((item): item is [string, unknown] => Array.isArray(item))
  );
};

export const convertResponseToForm = (connector: ConnectorResponse): ConnectorFormType => {
  const { metadata, type, config, syncProfile, isStandard, formItems, target } = connector;
  const { name, logo, logoDark } = metadata;
  const formConfig = conditional(formItems && initFormData(formItems, config)) ?? {};

  return {
    name: name?.en,
    logo,
    logoDark,
    target: conditional(
      type === ConnectorType.Social && (isStandard ? target : metadata.target ?? target)
    ),
    syncProfile: syncProfile ? SyncProfileMode.EachSignIn : SyncProfileMode.OnlyAtRegister,
    jsonConfig: JSON.stringify(config, null, 2),
    formConfig,
    rawConfig: config,
  };
};

export const convertFactoryResponseToForm = (
  connectorFactory: ConnectorFactoryResponse
): ConnectorFormType => {
  const { formItems, configTemplate, type, isStandard, target } = connectorFactory;
  const jsonConfig = configTemplate ?? '{}';
  const formConfig = conditional(formItems && initFormData(formItems)) ?? {};

  return {
    target: conditional(type === ConnectorType.Social && !isStandard && target),
    syncProfile: SyncProfileMode.OnlyAtRegister,
    jsonConfig,
    formConfig,
    rawConfig: {},
  };
};
