import { type ConnectorConfigFormItem } from './types/index.js';

export const confidentialValueMask = '******';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const maskLeafStrings = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return confidentialValueMask;
  }

  if (Array.isArray(value)) {
    return value.map((element) => maskLeafStrings(element));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, element]) => [key, maskLeafStrings(element)])
    );
  }

  return value;
};

const maskByPathSegments = (value: unknown, segments: readonly string[]): unknown => {
  if (segments.length === 0) {
    return maskLeafStrings(value);
  }

  if (Array.isArray(value)) {
    return value.map((element) => maskByPathSegments(element, segments));
  }

  if (!isRecord(value)) {
    return value;
  }

  const [head, ...rest] = segments;

  if (!head || !(head in value)) {
    return value;
  }

  return {
    ...value,
    [head]: maskByPathSegments(value[head], rest),
  };
};

/**
 * Mask confidential fields in a connector config object based on its `formItems` metadata.
 *
 * - For `Text` and `MultilineText` items with `isConfidential: true`, string values are masked to
 *   `'******'`.
 * - For `Json` items with `isConfidential: true`, all string leaf values inside the field are
 *   masked to `'******'`.
 * - For `Json` items with `isConfidential: string[]`, only the declared sub-keys (or dot-separated
 *   nested paths) are masked, preserving sibling non-sensitive keys and object/array structure.
 *
 * Does not mutate the input `config`.
 */
export const maskConfidentialConnectorConfig = (
  config: Record<string, unknown>,
  formItems?: readonly ConnectorConfigFormItem[]
): Record<string, unknown> => {
  if (!formItems || formItems.length === 0) {
    return { ...config };
  }

  const confidentialByKey = new Map<string, boolean | readonly string[]>(
    formItems.flatMap((item) =>
      'isConfidential' in item && item.isConfidential ? [[item.key, item.isConfidential]] : []
    )
  );

  if (confidentialByKey.size === 0) {
    return { ...config };
  }

  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => {
      const confidentiality = confidentialByKey.get(key);

      if (!confidentiality) {
        return [key, value];
      }

      if (confidentiality === true) {
        return [key, maskLeafStrings(value)];
      }

      const masked = confidentiality.reduce<unknown>((current, keyPath) => {
        const segments = keyPath.split('.').filter(Boolean);

        return segments.length > 0 ? maskByPathSegments(current, segments) : current;
      }, value);

      return [key, masked];
    })
  );
};
