import { type AdminConsoleKey } from '@logto/phrases';
import {
  DataHookSchema,
  InteractionHookEvent,
  hookEvents,
  type DataHookEvent,
  type LogKey,
} from '@logto/schemas';

type HookEventLabel = {
  // TODO: Implement all hook events
  [key in InteractionHookEvent]: AdminConsoleKey;
};

export const hookEventLabel = Object.freeze({
  [InteractionHookEvent.PostRegister]: 'webhooks.events.post_register',
  [InteractionHookEvent.PostResetPassword]: 'webhooks.events.post_reset_password',
  [InteractionHookEvent.PostSignIn]: 'webhooks.events.post_sign_in',
}) satisfies HookEventLabel;

export const dataHookEventsLabel = Object.freeze({
  [DataHookSchema.User]: 'webhooks.schemas.user',
  [DataHookSchema.Organization]: 'webhooks.schemas.organization',
  [DataHookSchema.Role]: 'webhooks.schemas.role',
  [DataHookSchema.Scope]: 'webhooks.schemas.scope',
  [DataHookSchema.OrganizationRole]: 'webhooks.schemas.organization_role',
  [DataHookSchema.OrganizationScope]: 'webhooks.schemas.organization_scope',
} satisfies Record<DataHookSchema, AdminConsoleKey>);

type HookEventLogKey = {
  // TODO: Implement all hook events
  [key in InteractionHookEvent]: LogKey;
};

export const hookEventLogKey = Object.freeze({
  [InteractionHookEvent.PostRegister]: 'TriggerHook.PostRegister',
  [InteractionHookEvent.PostResetPassword]: 'TriggerHook.PostResetPassword',
  [InteractionHookEvent.PostSignIn]: 'TriggerHook.PostSignIn',
}) satisfies HookEventLogKey;

const dataHookEvents: DataHookEvent[] = hookEvents.filter(
  (event): event is DataHookEvent => !(event in InteractionHookEvent)
);

const isDataHookSchema = (schema: string): schema is DataHookSchema => schema in DataHookSchema;

// Group DataHook events by schema
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

export const interactionHookEvents = Object.values(InteractionHookEvent);

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
