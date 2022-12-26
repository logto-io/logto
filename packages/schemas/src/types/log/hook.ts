import type { HookEvent } from '../../models/hooks.js';

/** The type of a hook event. */
export enum Type {
  ExchangeTokenBy = 'TriggerHook',
}

export type LogKey = `${Type}.${HookEvent}`;
