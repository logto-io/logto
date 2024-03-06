/**
 * Manually implement zod guards of some node OIDC provider types.
 *
 * Please note that we defined `accessTokenGuard` and `clientCredentialsGuard` in this file, they are used to make the user-defined token
 * sample to be aligned with the real token payload given by the OIDC provider in a real use case.
 *
 * But these token payload is not a pure "claims" payload, it contains some OIDC provider specific fields (e.g. `kind`). These fields could
 * be useful when the user relies on them to make conditional logic in the customization code scripts but will be ignored when the OIDC provider
 * processes the customized token payload to JWT token.
 *
 * TODO: @darcyYe LOG-8366
 * Find a proper way to "filter" those fields that will be ignored by the OIDC provider when processing the customized token payload.
 * So that we can make the "testing" function in the admin console to be more accurate.
 */
import { z } from 'zod';

import { jsonObjectGuard } from '../../foundations/index.js';

/**
 * Does not include built-in methods.
 * Ref:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0b7b01b70c4c211a4f69caf05008228ac065413c/types/oidc-provider/index.d.ts#L310
 * https://github.com/panva/node-oidc-provider/blob/270af1da83dda4c49edb4aaab48908f737d73379/lib/models/base_model.js#L11
 * https://github.com/panva/node-oidc-provider/blob/270af1da83dda4c49edb4aaab48908f737d73379/lib/models/base_token.js#L62
 */
const baseTokenGuardObject = {
  jti: z.string(),
  iat: z.number(),
  exp: z.number().optional(),
  clientId: z.string().optional(),
  kind: z.string(),
};

/**
 * Ref:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0b7b01b70c4c211a4f69caf05008228ac065413c/types/oidc-provider/index.d.ts#L550
 * https://github.com/panva/node-oidc-provider/blob/270af1da83dda4c49edb4aaab48908f737d73379/lib/models/access_token.js#L17
 *
 * We do not include `claims` field in this guard because we did not enabled the `feature.claimsParameter` in the oidc-provider.
 * If we enable the `feature.claimsParameter` feature in the future, we should include and implement the `claims` field guard.
 * `feature.claimsParameter`: https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#featuresclaimsparameter
 * OIDC claims parameter: https://openid.net/specs/openid-connect-core-1_0.html#ClaimsParameter
 */
export const accessTokenGuard = z.object({
  ...baseTokenGuardObject,
  kind: z.literal('AccessToken'),
  accountId: z.string(),
  aud: z.string().or(z.array(z.string())),
  extra: jsonObjectGuard.optional(),
  grantId: z.string(),
  scope: z.string().optional(),
  sid: z.string().optional(),
});

export type AccessToken = z.infer<typeof accessTokenGuard>;

/**
 * Ref:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0b7b01b70c4c211a4f69caf05008228ac065413c/types/oidc-provider/index.d.ts#L515
 * https://github.com/panva/node-oidc-provider/blob/270af1da83dda4c49edb4aaab48908f737d73379/lib/models/client_credentials.js#L11
 */
export const clientCredentialsGuard = z.object({
  ...baseTokenGuardObject,
  kind: z.literal('ClientCredentials'),
  aud: z.string().or(z.array(z.string())),
  extra: jsonObjectGuard.optional(),
  scope: z.string().optional(),
});

export type ClientCredentials = z.infer<typeof clientCredentialsGuard>;
