import type { ConnectorConfigFormItem } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorType } from '@logto/connector-kit';
import { type ConnectorFactoryResponse, type ConnectorResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { SyncProfileMode, type ConnectorFormType } from '@/types/connector';
import { safeParseJson } from '@/utils/json';

/**
 * @remarks
 * - When creating a new connector, this function will be called in the `convertFactoryResponseToForm()` method. At this time, there is no `config` data, so the default values in `formItems` are used.
 * - When editing an existing connector, this function will be called in the `convertResponseToForm()` method. `config` data will always exist, and the `config` data is used, never using the default values.
 */
const initFormData = (formItems: ConnectorConfigFormItem[], config?: Record<string, unknown>) => {
  const data: Array<[string, unknown]> = formItems.map((item) => {
    const configValue =
      config?.[item.key] ??
      conditional(item.type === ConnectorConfigFormItemType.Json && {}) ??
      conditional(item.type === ConnectorConfigFormItemType.MultiSelect && []);
    const { defaultValue } = item;
    const value = config ? configValue : defaultValue;

    if (item.type === ConnectorConfigFormItemType.Json) {
      return [item.key, JSON.stringify(value, null, 2)];
    }

    return [item.key, value];
  });

  return Object.fromEntries(data);
};

export const parseFormConfig = (
  config: Record<string, unknown>,
  formItems: ConnectorConfigFormItem[],
  skipFalsyValuesRemoval = false
) => {
  return Object.fromEntries(
    Object.entries(config)
      .map(([key, value]) => {
        // Filter out empty input
        if (!skipFalsyValuesRemoval && value === '') {
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
  const { metadata, type, config, syncProfile, isStandard, formItems, target, enableTokenStorage } =
    connector;
  const { name, logo, logoDark } = metadata;
  const formConfig = conditional(formItems && initFormData(formItems, config)) ?? {};

  return {
    name: name?.en,
    logo: logo ?? '',
    logoDark: logoDark ?? '',
    target: conditional(
      type === ConnectorType.Social && (isStandard ? target : (metadata.target ?? target))
    ),
    syncProfile: syncProfile ? SyncProfileMode.EachSignIn : SyncProfileMode.OnlyAtRegister,
    jsonConfig: JSON.stringify(config, null, 2),
    formConfig,
    rawConfig: config,
    enableTokenStorage,
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
    enableTokenStorage: false,
  };
};

/**
 * `scope` should be stored as a string with space-separated values.
 *  In some pages like Social connector form and Enterprise SSO connector form,
 *  we use Textarea to allow multi-line input, which allows users to input scopes in multiple lines.
 *  To prevent the scopes from being stored with newlines,
 *  we need to remove any newlines and trim the values before storing.
 **/
export const formatMultiLineScopeInput = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ');
