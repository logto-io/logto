/* eslint-disable max-lines */
// TODO: refactor this file to reduce LOC
import { parseJson } from '@logto/connector-kit';
import { Prompt, QueryKey, ReservedScope, UserScope } from '@logto/js';
import { type SamlAcsUrl } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { tryThat, appendPath, deduplicate } from '@silverhand/essentials';
import camelcaseKeys, { type CamelCaseKeys } from 'camelcase-keys';
import { XMLValidator } from 'fast-xml-parser';
import saml from 'samlify';
import { ZodError, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import {
  fetchOidcConfigRaw,
  getRawUserInfoResponse,
  handleTokenExchange,
} from '#src/sso/OidcConnector/utils.js';
import {
  idTokenProfileStandardClaimsGuard,
  type OidcConfigResponse,
  type IdTokenProfileStandardClaims,
} from '#src/sso/types/oidc.js';
import assertThat from '#src/utils/assert-that.js';

import {
  samlLogInResponseTemplate,
  samlAttributeNameFormatBasic,
  samlValueXmlnsXsi,
} from '../libraries/consts.js';
import { type SamlApplicationDetails } from '../queries/index.js';

/**
 * Determines the SAML NameID format and value based on the user's claims and IdP's NameID format.
 * Supports email and persistent formats.
 *
 * @param user - The user's standard claims
 * @param idpNameIDFormat - The NameID format(s) specified by the IdP (optional)
 * @returns An object containing the NameIDFormat and NameID
 */
const buildSamlAssertionNameId = (
  user: IdTokenProfileStandardClaims,
  idpNameIDFormat?: string | string[]
): { NameIDFormat: string; NameID: string } => {
  if (idpNameIDFormat) {
    // Get the first name ID format
    const format = Array.isArray(idpNameIDFormat) ? idpNameIDFormat[0] : idpNameIDFormat;
    // If email format is specified, try to use email first
    if (
      format === saml.Constants.namespace.format.emailAddress &&
      user.email &&
      user.email_verified
    ) {
      return {
        NameIDFormat: format,
        NameID: user.email,
      };
    }
    // For other formats or when email is not available, use sub
    if (format === saml.Constants.namespace.format.persistent) {
      return {
        NameIDFormat: format,
        NameID: user.sub,
      };
    }
  }
  // No nameIDFormat specified, use default logic
  // Use email if available
  if (user.email && user.email_verified) {
    return {
      NameIDFormat: saml.Constants.namespace.format.emailAddress,
      NameID: user.email,
    };
  }
  // Fallback to persistent format with user.sub
  return {
    NameIDFormat: saml.Constants.namespace.format.persistent,
    NameID: user.sub,
  };
};

export const createSamlTemplateCallback =
  (
    idp: saml.IdentityProviderInstance,
    sp: saml.ServiceProviderInstance,
    user: IdTokenProfileStandardClaims
  ) =>
  (template: string) => {
    const assertionConsumerServiceUrl = sp.entityMeta.getAssertionConsumerService(
      saml.Constants.wording.binding.post
    );

    const { nameIDFormat } = idp.entitySetting;
    const { NameIDFormat, NameID } = buildSamlAssertionNameId(user, nameIDFormat);

    const id = `ID_${generateStandardId()}`;
    const now = new Date();
    const expireAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes later

    const tagValues = {
      ID: id,
      AssertionID: `ID_${generateStandardId()}`,
      Destination: assertionConsumerServiceUrl,
      Audience: sp.entityMeta.getEntityID(),
      EntityID: sp.entityMeta.getEntityID(),
      SubjectRecipient: assertionConsumerServiceUrl,
      Issuer: idp.entityMeta.getEntityID(),
      IssueInstant: now.toISOString(),
      AssertionConsumerServiceURL: assertionConsumerServiceUrl,
      StatusCode: saml.Constants.StatusCode.Success,
      ConditionsNotBefore: now.toISOString(),
      ConditionsNotOnOrAfter: expireAt.toISOString(),
      SubjectConfirmationDataNotOnOrAfter: expireAt.toISOString(),
      NameIDFormat,
      NameID,
      // TODO: should get the request ID from the input parameters, pending https://github.com/logto-io/logto/pull/6881.
      InResponseTo: 'null',
      /**
       * User attributes for SAML response
       *
       * @todo Support custom attribute mapping
       * @see {@link https://github.com/tngan/samlify/blob/master/src/libsaml.ts#L275-L300|samlify implementation}
       *
       * @remarks
       * By examining the code provided in the link above, we can define all the attributes supported by the attribute mapping here. Only the attributes defined in the `loginResponseTemplate.attributes` added when creating the IdP instance will appear in the SAML response.
       */
      attrSub: user.sub,
      attrEmail: user.email,
      attrName: user.name,
    };

    const context = saml.SamlLib.replaceTagsByValue(template, tagValues);

    return {
      id,
      context,
    };
  };

export const exchangeAuthorizationCode = async (
  tokenEndpoint: string,
  {
    code,
    clientId,
    clientSecret,
    redirectUri,
  }: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
  }
) => {
  const result = await handleTokenExchange(tokenEndpoint, {
    code,
    clientId,
    clientSecret,
    redirectUri,
  });

  if (!result.success) {
    throw new RequestError({
      code: 'oidc.invalid_token',
      message: 'Invalid token response',
    });
  }

  return camelcaseKeys(result.data);
};

export const createSamlResponse = async (
  idp: saml.IdentityProviderInstance,
  sp: saml.ServiceProviderInstance,
  userInfo: IdTokenProfileStandardClaims
): Promise<{ context: string; entityEndpoint: string }> => {
  // TODO: fix binding method
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { context, entityEndpoint } = await idp.createLoginResponse(
    sp,
    // @ts-expect-error --fix request object later
    null,
    'post',
    userInfo,
    createSamlTemplateCallback(idp, sp, userInfo)
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return { context, entityEndpoint };
};

export const generateAutoSubmitForm = (actionUrl: string, samlResponse: string): string => {
  return `
    <html>
      <body>
        <form id="redirectForm" action="${actionUrl}" method="POST">
          <input type="hidden" name="SAMLResponse" value="${samlResponse}" />
        </form>
        <script>
          window.onload = function() {
            document.getElementById('redirectForm').submit();
          };
        </script>
      </body>
    </html>
  `;
};

export const getUserInfo = async (
  accessToken: string,
  userinfoEndpoint: string
): Promise<IdTokenProfileStandardClaims & Record<string, unknown>> => {
  const body = await getRawUserInfoResponse(accessToken, userinfoEndpoint);
  const result = idTokenProfileStandardClaimsGuard.catchall(z.unknown()).safeParse(parseJson(body));

  if (!result.success) {
    throw new RequestError({
      code: 'oidc.invalid_request',
      message: 'Invalid user info response',
      details: result.error.flatten(),
    });
  }

  return result.data;
};

// Helper functions for SAML callback
export const handleOidcCallbackAndGetUserInfo = async (
  code: string,
  applicationId: string,
  secret: string,
  redirectUri: string,
  issuer: string
) => {
  // Get OIDC configuration
  const { tokenEndpoint, userinfoEndpoint } = await getOidcConfig(issuer);

  // Exchange authorization code for tokens
  const { accessToken } = await exchangeAuthorizationCode(tokenEndpoint, {
    code,
    clientId: applicationId,
    clientSecret: secret,
    redirectUri,
  });

  assertThat(accessToken, new RequestError('oidc.access_denied'));

  // Get user info using access token
  return getUserInfo(accessToken, userinfoEndpoint);
};

const getOidcConfig = async (issuer: string): Promise<CamelCaseKeys<OidcConfigResponse>> => {
  const oidcConfig = await tryThat(
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

  return oidcConfig;
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
  const { authorizationEndpoint } = await getOidcConfig(issuer);

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
    privateKey,
    certificate,
  } = details;

  assertThat(acsUrl, 'application.saml.acs_url_required');
  assertThat(entityId, 'application.saml.entity_id_required');
  assertThat(redirectUris[0], 'oidc.invalid_redirect_uri');

  assertThat(privateKey, 'application.saml.private_key_required');
  assertThat(certificate, 'application.saml.certificate_required');

  return {
    entityId,
    acsUrl,
    redirectUri: redirectUris[0],
    privateKey,
    certificate,
  };
};

export const getSamlIdpAndSp = ({
  idp: { metadata, privateKey, certificate },
  sp: { entityId, acsUrl },
}: {
  idp: { metadata: string; privateKey: string; certificate: string };
  sp: { entityId: string; acsUrl: SamlAcsUrl };
}): { idp: saml.IdentityProviderInstance; sp: saml.ServiceProviderInstance } => {
  // eslint-disable-next-line new-cap
  const idp = saml.IdentityProvider({
    metadata,
    privateKey,
    isAssertionEncrypted: false,
    loginResponseTemplate: {
      context: samlLogInResponseTemplate,
      attributes: [
        {
          name: 'email',
          valueTag: 'email',
          nameFormat: samlAttributeNameFormatBasic,
          valueXsiType: samlValueXmlnsXsi.string,
        },
        {
          name: 'name',
          valueTag: 'name',
          nameFormat: samlAttributeNameFormatBasic,
          valueXsiType: samlValueXmlnsXsi.string,
        },
      ],
    },
    nameIDFormat: [
      saml.Constants.namespace.format.emailAddress,
      saml.Constants.namespace.format.persistent,
    ],
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

export const buildSamlAppCallbackUrl = (baseUrl: URL, samlApplicationId: string) =>
  appendPath(baseUrl, `api/saml-applications/${samlApplicationId}/callback`).toString();
/* eslint-enable max-lines */
