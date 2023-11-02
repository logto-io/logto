import { socialUserInfoGuard, socialUserInfoKeys } from '@logto/connector-kit';
import { conditional } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import { z } from 'zod';

export enum MetadataType {
  XML = 'XML',
  URL = 'URL',
}

export type ProfileMap = Required<z.infer<typeof socialUserInfoGuard>>;

const attributeMapGuard = socialUserInfoGuard.partial();
type AttributeMap = z.infer<typeof attributeMapGuard>;

/**
 * Get the full attribute mapping using specified attribute mappings with default fallback values.
 *
 * @param attributeMapping Specified attribute mapping stored in database
 * @returns Full attribute mapping with default fallback values
 */
export const attributeMappingPostProcessor = (attributeMapping?: AttributeMap): ProfileMap => {
  return {
    // eslint-disable-next-line no-restricted-syntax
    ...(Object.fromEntries(socialUserInfoKeys.map((key) => [key, key])) as ProfileMap),
    ...conditional(attributeMapping && cleanDeep(attributeMapping)),
  };
};

const basicSamlCommonFields = {
  attributeMapping: attributeMapGuard.optional(),
  signInEndpoint: z.string().optional(),
  entityId: z.string().optional(),
  x509Certificate: z.string().optional(),
};

export const baseSamlConnectorConfigGuard = z.discriminatedUnion('metadataType', [
  z.object({
    metadataType: z.literal(MetadataType.URL),
    metadataUrl: z.string().url(),
    ...basicSamlCommonFields,
  }),
  z.object({
    metadataType: z.literal(MetadataType.XML),
    metadataXml: z.string(),
    ...basicSamlCommonFields,
  }),
]);

export type BaseSamlConnectorConfig = z.infer<typeof baseSamlConnectorConfigGuard>;

/**
 * Zod discriminate union does not support its partial util method, we need to manually implement this.
 * This is for guarding the config on creating.
 */
export const basicSamlConnectorConfigPartialGuard = z.discriminatedUnion('metadataType', [
  z
    .object({
      metadataUrl: z.string().url(),
      ...basicSamlCommonFields,
    })
    .partial()
    .merge(z.object({ metadataType: z.literal(MetadataType.URL) })),
  z
    .object({
      metadataXml: z.string(),
      ...basicSamlCommonFields,
    })
    .partial()
    .merge(z.object({ metadataType: z.literal(MetadataType.XML) })),
]);

export const samlMetadataGuard = z.object({
  entityId: z.string(),
  nameIdFormat: z.string().array().optional(),
  signInEndpoint: z.string(),
  signingAlgorithm: z.string(),
  x509Certificate: z.string(),
});

export type SamlMetadata = z.infer<typeof samlMetadataGuard>;

export type BaseSamlConfig = BaseSamlConnectorConfig & SamlMetadata;
