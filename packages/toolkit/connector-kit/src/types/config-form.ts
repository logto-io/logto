import { z } from 'zod';

export enum ConnectorConfigFormItemType {
  Text = 'Text',
  Number = 'Number',
  MultilineText = 'MultilineText',
  Switch = 'Switch',
  Select = 'Select',
  MultiSelect = 'MultiSelect',
  Json = 'Json',
}

const baseConfigFormItem = {
  key: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  showConditions: z
    .array(z.object({ targetKey: z.string(), expectValue: z.unknown().optional() }))
    .optional(),
  description: z.string().optional(),
  tooltip: z.string().optional(),
  isDevFeature: z.boolean().optional(), // For development feature flag.
};

export const connectorConfigFormItemGuard = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(ConnectorConfigFormItemType.Select),
    selectItems: z.array(z.object({ value: z.string(), title: z.string() })),
    ...baseConfigFormItem,
  }),
  z.object({
    type: z.literal(ConnectorConfigFormItemType.MultiSelect),
    selectItems: z.array(z.object({ value: z.string() })),
    ...baseConfigFormItem,
  }),
  z.object({
    type: z.enum([ConnectorConfigFormItemType.Text, ConnectorConfigFormItemType.MultilineText]),
    isConfidential: z.boolean().optional(),
    ...baseConfigFormItem,
  }),
  z.object({
    type: z.literal(ConnectorConfigFormItemType.Json),
    /**
     * Marks the JSON field (when `true`) or specific nested keys within it (when an array of key
     * names or dot-separated paths) as confidential so credential masking can redact them while
     * leaving non-sensitive fields intact.
     */
    isConfidential: z.union([z.boolean(), z.array(z.string().min(1))]).optional(),
    ...baseConfigFormItem,
  }),
  z.object({
    type: z.enum([ConnectorConfigFormItemType.Number, ConnectorConfigFormItemType.Switch]),
    ...baseConfigFormItem,
  }),
]);

export type ConnectorConfigFormItem = z.infer<typeof connectorConfigFormItemGuard>;
