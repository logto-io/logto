import type { ZodType } from 'zod';
import { z } from 'zod';

// Alteration state
export enum AlterationStateKey {
  AlterationState = 'alterationState',
}

export type AlterationState = { timestamp: number; updatedAt?: string };

export type AlterationStateType = {
  [AlterationStateKey.AlterationState]: AlterationState;
};

export const alterationStateGuard: Readonly<{
  [key in AlterationStateKey]: ZodType<AlterationStateType[key]>;
}> = Object.freeze({
  [AlterationStateKey.AlterationState]: z.object({
    timestamp: z.number(),
    updatedAt: z.string().optional(),
  }),
});

// Summary
export type SystemKey = AlterationStateKey;
export type SystemType = AlterationStateType;
export type SystemGuard = typeof alterationStateGuard;

export const systemKeys: readonly SystemKey[] = Object.freeze(Object.values(AlterationStateKey));

export const systemGuards: SystemGuard = Object.freeze({
  ...alterationStateGuard,
});
