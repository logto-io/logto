import { Static, Type } from "@sinclair/typebox";

export const Token = Type.Object({
  id_token: Type.String(),
  token_type: Type.String(),
  not_before: Type.Number(),
  id_token_expires_in: Type.Number(),
  profile_info: Type.String(),
  scope: Type.String(),
});

export type TokenType = Static<typeof Token>;
