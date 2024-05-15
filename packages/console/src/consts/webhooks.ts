import { type AdminConsoleKey } from '@logto/phrases';
import {
  DataHookSchema,
  InteractionHookEvent,
  hookEvents,
  type DataHookEvent,
} from '@logto/schemas';

export const dataHookEventsLabel = Object.freeze({
  [DataHookSchema.User]: 'webhooks.schemas.user',
  [DataHookSchema.Organization]: 'webhooks.schemas.organization',
  [DataHookSchema.Role]: 'webhooks.schemas.role',
  [DataHookSchema.Scope]: 'webhooks.schemas.scope',
  [DataHookSchema.OrganizationRole]: 'webhooks.schemas.organization_role',
  [DataHookSchema.OrganizationScope]: 'webhooks.schemas.organization_scope',
} satisfies Record<DataHookSchema, AdminConsoleKey>);

export const interactionHookEvents = Object.values(InteractionHookEvent);

const dataHookEvents: DataHookEvent[] = hookEvents.filter(
  // eslint-disable-next-line no-restricted-syntax
  (event): event is DataHookEvent => !interactionHookEvents.includes(event as InteractionHookEvent)
);

const isDataHookSchema = (schema: string): schema is DataHookSchema =>
  // eslint-disable-next-line no-restricted-syntax
  Object.values(DataHookSchema).includes(schema as DataHookSchema);

// Group DataHook events by schema
// TODO: Replace this using `groupBy` once Node v22 goes LTS
const schemaGroupedDataHookEventsMap = dataHookEvents.reduce<Map<DataHookSchema, DataHookEvent[]>>(
  (eventGroup, event) => {
    const [schema] = event.split('.');

    if (schema && isDataHookSchema(schema)) {
      eventGroup.set(schema, [...(eventGroup.get(schema) ?? []), event]);
    }

    return eventGroup;
  },
  new Map()
);

// Sort the grouped `DataHook` events per console product design
const hookEventSchemaOrder: {
  [key in DataHookSchema]: number;
} = {
  [DataHookSchema.User]: 0,
  [DataHookSchema.Organization]: 1,
  [DataHookSchema.Role]: 2,
  [DataHookSchema.OrganizationRole]: 3,
  [DataHookSchema.Scope]: 4,
  [DataHookSchema.OrganizationScope]: 5,
};

export const schemaGroupedDataHookEvents = Array.from(schemaGroupedDataHookEventsMap.entries())
  .slice()
  .sort(([schemaA], [schemaB]) => hookEventSchemaOrder[schemaA] - hookEventSchemaOrder[schemaB]);
