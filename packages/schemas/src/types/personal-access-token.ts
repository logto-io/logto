import { type z } from 'zod';

import { PersonalAccessTokens } from '../db-entries/index.js';

/** Personal access token metadata returned by the Account API. The secret value is never included. */
export const accountPersonalAccessTokenResponseGuard = PersonalAccessTokens.guard.pick({
  name: true,
  createdAt: true,
  expiresAt: true,
});

export type AccountPersonalAccessTokenResponse = z.infer<
  typeof accountPersonalAccessTokenResponseGuard
>;

/** Account API response for a newly created personal access token, including the one-time secret. */
export const accountCreatedPersonalAccessTokenResponseGuard =
  accountPersonalAccessTokenResponseGuard.extend({
    value: PersonalAccessTokens.guard.shape.value,
  });

export type AccountCreatedPersonalAccessTokenResponse = z.infer<
  typeof accountCreatedPersonalAccessTokenResponseGuard
>;
