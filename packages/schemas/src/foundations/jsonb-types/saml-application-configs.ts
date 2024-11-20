import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

export type SamlAttributeMapping = Record<string, string>;

export const samlAttributeMappingGuard = z.record(
  z.string()
) satisfies z.ZodType<SamlAttributeMapping>;

// Only support SP HTTP-POST binding for now.
export enum BindingType {
  POST = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
}

export type SamlAcsUrl = {
  binding?: BindingType;
  url: string;
};

export const samlAcsUrlGuard = z.object({
  binding: z.nativeEnum(BindingType).optional().default(BindingType.POST),
  url: z.string(),
}) satisfies ToZodObject<SamlAcsUrl>;
