import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

export type SamlAttributeMapping = Record<string, string>;

export const samlAttributeMappingGuard = z.record(
  z.string()
) satisfies z.ZodType<SamlAttributeMapping>;

export enum BindingType {
  POST = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
  REDIRECT = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
}

export type SamlAcsUrl = {
  binding?: BindingType;
  url: string;
};

export const samlAcsUrlGuard = z.object({
  binding: z.nativeEnum(BindingType),
  url: z.string(),
}) satisfies ToZodObject<SamlAcsUrl>;
