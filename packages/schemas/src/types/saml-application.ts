import { type z } from 'zod';

import { Applications } from '../db-entries/application.js';
import { SamlApplicationConfigs } from '../db-entries/saml-application-config.js';

import { applicationCreateGuard } from './application.js';

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
  .extend({
    // The reason for encapsulating attributeMapping and spMetadata into an object within the config field is that you cannot provide only one of `attributeMapping` or `spMetadata`. Due to the structure of the `saml_application_configs` table, both must be not null.
    config: samlAppConfigGuard.partial().optional(),
  });

export type CreateSamlApplication = z.infer<typeof samlApplicationCreateGuard>;

export const samlApplicationResponseGuard = Applications.guard.merge(
  // Partial to allow the optional fields to be omitted in the response.
  // When starting to create a SAML application, SAML configuration is optional, which can lead to the absence of SAML configuration.
  samlAppConfigGuard
);

export type SamlApplicationResponse = z.infer<typeof samlApplicationResponseGuard>;
