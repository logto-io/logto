import { type ToZodObject } from '@logto/connector-kit';
import { completeUserClaims, type UserClaim } from '@logto/core-kit';
import { z } from 'zod';

export type SamlAttributeMapping = Partial<Record<UserClaim | 'id', string>>;

export const samlAttributeMappingKeys = Object.freeze(['id', ...completeUserClaims] satisfies Array<
  keyof SamlAttributeMapping
>);

export const samlAttributeMappingGuard = z
  .object(
    Object.fromEntries(
      samlAttributeMappingKeys.map((claim): [UserClaim | 'id', z.ZodString] => [claim, z.string()])
    )
  )
  .partial() satisfies z.ZodType<SamlAttributeMapping>;

export enum BindingType {
  Post = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
  Redirect = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
}

export type SamlAcsUrl = {
  binding: BindingType;
  url: string;
};

export const samlAcsUrlGuard = z.object({
  binding: z.nativeEnum(BindingType),
  url: z.string().url(),
}) satisfies ToZodObject<SamlAcsUrl>;
