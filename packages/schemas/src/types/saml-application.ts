import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { Applications } from '../db-entries/application.js';
import { SamlApplicationConfigs } from '../db-entries/saml-application-config.js';
import { SamlApplicationSecrets } from '../db-entries/saml-application-secret.js';

import { applicationCreateGuard, applicationPatchGuard } from './application.js';

const samlAppConfigGuard = SamlApplicationConfigs.guard.pick({
  attributeMapping: true,
  entityId: true,
  acsUrl: true,
});

export const samlApplicationCreateGuard = applicationCreateGuard
  .pick({
    name: true,
    description: true,
    customData: true,
  })
  // The reason for encapsulating attributeMapping and spMetadata into an object within the config field is that you cannot provide only one of `attributeMapping` or `spMetadata`. Due to the structure of the `saml_application_configs` table, both must be not null.
  .merge(samlAppConfigGuard.partial());

export type CreateSamlApplication = z.infer<typeof samlApplicationCreateGuard>;

export const samlApplicationPatchGuard = applicationPatchGuard
  .pick({
    name: true,
    description: true,
    customData: true,
  })
  // The reason for encapsulating attributeMapping and spMetadata into an object within the config field is that you cannot provide only one of `attributeMapping` or `spMetadata`. Due to the structure of the `saml_application_configs` table, both must be not null.
  .merge(samlAppConfigGuard.partial());

export type PatchSamlApplication = z.infer<typeof samlApplicationPatchGuard>;

export const samlApplicationResponseGuard = Applications.guard
  .omit({
    secret: true,
    oidcClientMetadata: true,
    customClientMetadata: true,
    protectedAppMetadata: true,
  })
  .merge(
    // Partial to allow the optional fields to be omitted in the response.
    // When starting to create a SAML application, SAML configuration is optional, which can lead to the absence of SAML configuration.
    samlAppConfigGuard
  );

export type SamlApplicationResponse = z.infer<typeof samlApplicationResponseGuard>;

type FingerprintFormat = {
  formatted: string;
  unformatted: string;
};

const fingerprintFormatGuard = z.object({
  formatted: z.string(),
  unformatted: z.string(),
}) satisfies ToZodObject<FingerprintFormat>;

export type CertificateFingerprints = {
  sha256: FingerprintFormat;
};

export const certificateFingerprintsGuard = z.object({
  sha256: fingerprintFormatGuard,
}) satisfies ToZodObject<CertificateFingerprints>;

// Make sure the `privateKey` is not exposed in the response.
export const samlApplicationSecretResponseGuard = SamlApplicationSecrets.guard
  .omit({
    tenantId: true,
    applicationId: true,
    privateKey: true,
  })
  .extend({
    fingerprints: certificateFingerprintsGuard,
  });

export type SamlApplicationSecretResponse = z.infer<typeof samlApplicationSecretResponseGuard>;
