import { Prompt, QueryKey, ReservedScope, UserScope } from '@logto/js';
import { type SamlAcsUrl } from '@logto/schemas';
import { deduplicate, tryThat } from '@silverhand/essentials';
import { XMLValidator } from 'fast-xml-parser';
import saml from 'samlify';
import { z, ZodError } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { fetchOidcConfigRaw } from '#src/sso/OidcConnector/utils.js';
import assertThat from '#src/utils/assert-that.js';

import { type SamlApplicationDetails } from '../queries/index.js';

const getAuthorizationEndpoint = async (issuer: string): Promise<string> => {
  const { authorizationEndpoint } = await tryThat(
    async () => fetchOidcConfigRaw(issuer),
    (error) => {
      if (error instanceof ZodError) {
        throw new RequestError({
          code: 'oidc.invalid_request',
          message: error.message,
          error: error.flatten(),
        });
      }

      throw error;
    }
  );

  return authorizationEndpoint;
};

export const getSignInUrl = async ({
  issuer,
  applicationId,
  redirectUri,
  scope,
  state,
}: {
  issuer: string;
  applicationId: string;
  redirectUri: string;
  scope?: string;
  state?: string;
}) => {
  const authorizationEndpoint = await getAuthorizationEndpoint(issuer);

  const queryParameters = new URLSearchParams({
    [QueryKey.ClientId]: applicationId,
    [QueryKey.RedirectUri]: redirectUri,
    [QueryKey.ResponseType]: 'code',
    [QueryKey.Prompt]: Prompt.Login,
  });

  // TODO: get value of `scope` parameters according to setup in attribute mapping.
  queryParameters.append(
    QueryKey.Scope,
    // For security reasons, DO NOT include the offline_access scope by default.
    deduplicate([
      ReservedScope.OpenId,
      UserScope.Profile,
      UserScope.Roles,
      UserScope.Organizations,
      UserScope.OrganizationRoles,
      UserScope.CustomData,
      UserScope.Identities,
      ...(scope?.split(' ') ?? []),
    ]).join(' ')
  );

  if (state) {
    queryParameters.append(QueryKey.State, state);
  }

  return new URL(`${authorizationEndpoint}?${queryParameters.toString()}`);
};

export const validateSamlApplicationDetails = (details: SamlApplicationDetails) => {
  const {
    entityId,
    acsUrl,
    oidcClientMetadata: { redirectUris },
  } = details;

  assertThat(acsUrl, 'application.saml.acs_url_required');
  assertThat(entityId, 'application.saml.entity_id_required');
  assertThat(redirectUris[0], 'oidc.invalid_redirect_uri');

  return {
    entityId,
    acsUrl,
    redirectUri: redirectUris[0],
  };
};

export const getSamlIdpAndSp = ({
  idp: { metadata, certificate },
  sp: { entityId, acsUrl },
}: {
  idp: { metadata: string; certificate: string };
  sp: { entityId: string; acsUrl: SamlAcsUrl };
}): { idp: saml.IdentityProviderInstance; sp: saml.ServiceProviderInstance } => {
  // eslint-disable-next-line new-cap
  const idp = saml.IdentityProvider({
    metadata,
  });

  // eslint-disable-next-line new-cap
  const sp = saml.ServiceProvider({
    entityID: entityId,
    assertionConsumerService: [
      {
        Binding: acsUrl.binding,
        Location: acsUrl.url,
      },
    ],
    signingCert: certificate,
    authnRequestsSigned: idp.entityMeta.isWantAuthnRequestsSigned(),
    allowCreate: false,
  });

  // Used to check whether xml content is valid in format.
  saml.setSchemaValidator({
    validate: async (xmlContent: string) => {
      try {
        XMLValidator.validate(xmlContent, {
          allowBooleanAttributes: true,
        });

        return true;
      } catch {
        return false;
      }
    },
  });

  return { idp, sp };
};

export const loginRequestExtractGuard = z.object({
  issuer: z.string(),
  request: z.object({
    id: z.string(),
    destination: z.string(),
    issueInstant: z.string(),
    assertionConsumerServiceUrl: z.string(),
  }),
});
