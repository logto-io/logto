import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

export type SamlAttributeMapping = Record<string, string>;

export const samlAttributeMappingGuard = z.record(
  z.string()
) satisfies z.ZodType<SamlAttributeMapping>;

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

export const samlEncryptionGuard = z
  .object({
    encryptAssertion: z.boolean().optional(),
    encryptThenSign: z.boolean().optional(),
    certificate: z.string().optional(),
  })
  .superRefine(({ encryptAssertion, encryptThenSign, certificate }, ctx) => {
    if (encryptAssertion && (encryptThenSign === undefined || certificate === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          '`encryptThenSign` and `certificate` are required when `encryptAssertion` is `true`',
      });
      return z.NEVER;
    }
  });

export type SamlEncryption = z.input<typeof samlEncryptionGuard>;

export enum NameIdFormat {
  /** The Identity Provider can determine the format. */
  Unspecified = 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
  /** Returns the email address of the user. */
  EmailAddress = 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  /** Uses unique and persistent identifiers for the user. */
  Persistent = 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
  /** Uses unique and transient identifiers for the user, which can be different for each session. */
  Transient = 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
}

export const nameIdFormatGuard = z.nativeEnum(NameIdFormat);
