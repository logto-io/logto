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
  isConfidential: z.boolean().optional(), // For `Text` type only.
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
    type: z.enum([
      ConnectorConfigFormItemType.Text,
      ConnectorConfigFormItemType.Number,
      ConnectorConfigFormItemType.MultilineText,
      ConnectorConfigFormItemType.Switch,
      ConnectorConfigFormItemType.Json,
    ]),
    ...baseConfigFormItem,
  }),
]);

export type ConnectorConfigFormItem = z.infer<typeof connectorConfigFormItemGuard>;
