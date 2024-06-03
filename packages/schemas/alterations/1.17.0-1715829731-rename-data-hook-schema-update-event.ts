import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum DataHookSchema {
  User = 'User',
  Role = 'Role',
  Scope = 'Scope',
  Organization = 'Organization',
  OrganizationRole = 'OrganizationRole',
  OrganizationScope = 'OrganizationScope',
}

type OldSchemaUpdateEvent = `${DataHookSchema}.${'Updated'}`;
type NewSchemaUpdateEvent = `${DataHookSchema}.Data.Updated`;

const oldSchemaUpdateEvents = Object.freeze([
  'User.Updated',
  'Role.Updated',
  'Scope.Updated',
  'Organization.Updated',
  'OrganizationRole.Updated',
  'OrganizationScope.Updated',
] satisfies OldSchemaUpdateEvent[]);

const newSchemaUpdateEvents = Object.freeze([
  'User.Data.Updated',
  'Role.Data.Updated',
  'Scope.Data.Updated',
  'Organization.Data.Updated',
  'OrganizationRole.Data.Updated',
  'OrganizationScope.Data.Updated',
] as const satisfies NewSchemaUpdateEvent[]);

const updateMap: { [key in OldSchemaUpdateEvent]: NewSchemaUpdateEvent } = {
  'User.Updated': 'User.Data.Updated',
  'Role.Updated': 'Role.Data.Updated',
  'Scope.Updated': 'Scope.Data.Updated',
  'Organization.Updated': 'Organization.Data.Updated',
  'OrganizationRole.Updated': 'OrganizationRole.Data.Updated',
  'OrganizationScope.Updated': 'OrganizationScope.Data.Updated',
};

const reverseMap: { [key in NewSchemaUpdateEvent]: OldSchemaUpdateEvent } = {
  'User.Data.Updated': 'User.Updated',
  'Role.Data.Updated': 'Role.Updated',
  'Scope.Data.Updated': 'Scope.Updated',
  'Organization.Data.Updated': 'Organization.Updated',
  'OrganizationRole.Data.Updated': 'OrganizationRole.Updated',
  'OrganizationScope.Data.Updated': 'OrganizationScope.Updated',
};

// This alteration script filters all the hook's events jsonb column to replace all the old schema update events with the new schema update events.

const isOldSchemaUpdateEvent = (event: string): event is OldSchemaUpdateEvent =>
  // eslint-disable-next-line no-restricted-syntax
  oldSchemaUpdateEvents.includes(event as OldSchemaUpdateEvent);

const isNewSchemaUpdateEvent = (event: string): event is NewSchemaUpdateEvent =>
  // eslint-disable-next-line no-restricted-syntax
  newSchemaUpdateEvents.includes(event as NewSchemaUpdateEvent);

const alteration: AlterationScript = {
  up: async (pool) => {
    const { rows: hooks } = await pool.query<{ id: string; events: string[] }>(sql`
      select id, events
      from hooks
    `);

    const hooksToBeUpdate = hooks.filter(({ events }) => {
      return oldSchemaUpdateEvents.some((oldEvent) => events.includes(oldEvent));
    });

    await Promise.all(
      hooksToBeUpdate.map(async ({ id, events }) => {
        const updateEvents = events.reduce<string[]>((accumulator, event) => {
          if (isOldSchemaUpdateEvent(event)) {
            return [...accumulator, updateMap[event]];
          }
          return [...accumulator, event];
        }, []);

        await pool.query(sql`
          update hooks
          set events = ${JSON.stringify(updateEvents)}
          where id = ${id};
        `);
      })
    );
  },
  down: async (pool) => {
    const { rows: hooks } = await pool.query<{ id: string; events: string[] }>(sql`
      select id, events
      from hooks
    `);

    const hooksToBeUpdate = hooks.filter(({ events }) => {
      return newSchemaUpdateEvents.some((newEvent) => events.includes(newEvent));
    });

    await Promise.all(
      hooksToBeUpdate.map(async ({ id, events }) => {
        const updateEvents = events.reduce<string[]>((accumulator, event) => {
          if (isNewSchemaUpdateEvent(event)) {
            return [...accumulator, reverseMap[event]];
          }
          return [...accumulator, event];
        }, []);

        await pool.query(sql`
          update hooks
          set events = ${JSON.stringify(updateEvents)}
          where id = ${id};
        `);
      })
    );
  },
};

export default alteration;
