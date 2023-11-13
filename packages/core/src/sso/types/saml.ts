import { socialUserInfoGuard } from '@logto/connector-kit';
import { jsonGuard } from '@logto/schemas';
import { z } from 'zod';

// Since the SAML SSO user info will extend the basic social user info (will contain extra info like `organization`, `role` etc.), but for now we haven't decide what should be included in extended user info, so we just use the basic social user info guard here to keep SSOT.
const samlAttributeMappingGuard = socialUserInfoGuard;

// eslint-disable-next-line no-restricted-syntax
export const defaultAttributeMapping = Object.fromEntries(
  Object.keys(samlAttributeMappingGuard.shape).map((key) => [key, key])
) as AttributeMap;

const customizableAttributeMappingGuard = samlAttributeMappingGuard.partial();
export type CustomizableAttributeMap = z.infer<typeof customizableAttributeMappingGuard>;
export type AttributeMap = Required<CustomizableAttributeMap>;

export const samlConnectorConfigGuard = z
  .object({
    attributeMapping: customizableAttributeMappingGuard,
    signInEndpoint: z.string(),
    entityId: z.string(),
    x509Certificate: z.string(),
    metadataUrl: z.string(),
    metadata: z.string(),
  })
  .partial();

export type SamlConnectorConfig = z.infer<typeof samlConnectorConfigGuard>;

export const samlMetadataGuard = z
  .object({
    entityId: z.string(),
    nameIdFormat: z.string().array().optional(),
    signInEndpoint: z.string(),
    signingAlgorithm: z.string().optional(),
    x509Certificate: z.string(),
  })
  .catchall(jsonGuard); // Allow extra fields, also need to fit the `JsonObject` type.

export type SamlMetadata = z.infer<typeof samlMetadataGuard>;

export type SamlConfig = SamlConnectorConfig & SamlMetadata;

// Saml assertion returned user attribute value
export const extendedSocialUserInfoGuard = socialUserInfoGuard.catchall(z.unknown());
export type ExtendedSocialUserInfo = z.infer<typeof extendedSocialUserInfoGuard>;
