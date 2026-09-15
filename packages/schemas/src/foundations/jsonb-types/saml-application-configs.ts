import { type ToZodObject } from '@logto/connector-kit';
import { userClaimsList, type UserClaim } from '@logto/core-kit';
import { z } from 'zod';

export type SamlAttributeMapping = Partial<Record<UserClaim | 'sub', string>>;

export const samlAttributeMappingKeys = Object.freeze(['sub', ...userClaimsList] satisfies Array<
  keyof SamlAttributeMapping
>);

export const samlAttributeMappingGuard = z
  .object(
    Object.fromEntries(
      samlAttributeMappingKeys.map((claim): [UserClaim | 'sub', z.ZodString] => [claim, z.string()])
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

/** Authentication and request-signature policy for a SAML application. */
export const samlAuthnRequestConfigGuard = z
  .object({
    forceAuthn: z.boolean().optional(),
    requireSignedAuthnRequests: z.boolean().optional(),
    signingCertificate: z.string().trim().min(1).optional(),
  })
  .superRefine(({ requireSignedAuthnRequests, signingCertificate }, ctx) => {
    if (requireSignedAuthnRequests && !signingCertificate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['signingCertificate'],
        message: '`signingCertificate` is required when `requireSignedAuthnRequests` is `true`',
      });
    }
  });

export type SamlAuthnRequestConfig = z.infer<typeof samlAuthnRequestConfigGuard>;

export enum NameIdFormat {
  /** Uses unique and persistent identifiers for the user. */
  Persistent = 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
  /** Returns the email address of the user. */
  EmailAddress = 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  /** Uses unique and transient identifiers for the user, which can be different for each session. */
  Transient = 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
  /** The Identity Provider can determine the format. */
  Unspecified = 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
}

export const nameIdFormatGuard = z.nativeEnum(NameIdFormat);
