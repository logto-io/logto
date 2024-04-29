import type { HookEvent } from '../../foundations/index.js';

/** The type of a hook event. */
export enum Type {
  TriggerHook = 'TriggerHook',
}

export type LogKey = `${Type}.${HookEvent}`;
