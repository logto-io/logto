import { type ConnectorConfigFormItem } from '@logto/connector-kit';

export const confidentialValueMask = '******';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const maskLeafStrings = (value: unknown, mask: string): unknown => {
  if (typeof value === 'string') {
    return mask;
  }

  if (Array.isArray(value)) {
    return value.map((element) => maskLeafStrings(element, mask));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, element]) => [key, maskLeafStrings(element, mask)])
    );
  }

  return value;
};

/**
 * Mask confidential fields in a connector config object based on its `formItems` metadata.
 *
 * - For `Text` and `MultilineText` items with `isConfidential: true`, string values are masked.
 * - For `Json` items with `isConfidential: true`, all string leaf values inside the field are
 *   masked while preserving object/array structure and non-string primitives.
 *
 * Does not mutate the input `config`.
 */
export const maskConfidentialConnectorConfig = (
  config: Record<string, unknown>,
  formItems?: readonly ConnectorConfigFormItem[],
  mask = confidentialValueMask
): Record<string, unknown> => {
  if (!formItems || formItems.length === 0) {
    return { ...config };
  }

  const confidentialKeys = new Set(
    formItems.filter((item) => item.isConfidential).map((item) => item.key)
  );

  if (confidentialKeys.size === 0) {
    return { ...config };
  }

  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      key,
      confidentialKeys.has(key) ? maskLeafStrings(value, mask) : value,
    ])
  );
};
