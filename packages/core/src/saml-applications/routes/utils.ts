import { parseJson } from '@logto/connector-kit';
import { generateStandardId } from '@logto/shared';
import { tryThat, appendPath } from '@silverhand/essentials';
import camelcaseKeys from 'camelcase-keys';
import saml from 'samlify';
import { ZodError, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import {
  fetchOidcConfigRaw,
  getRawUserInfoResponse,
  handleTokenExchange,
} from '#src/sso/OidcConnector/utils.js';
import { idTokenProfileStandardClaimsGuard } from '#src/sso/types/oidc.js';
import { type IdTokenProfileStandardClaims } from '#src/sso/types/oidc.js';
import assertThat from '#src/utils/assert-that.js';

import {
  samlLogInResponseTemplate,
  samlAttributeNameFormatBasic,
  samlValueXmlnsXsi,
} from '../libraries/consts.js';

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
  const { tokenEndpoint, userinfoEndpoint } = await tryThat(
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

export const setupSamlProviders = (
  metadata: string,
  privateKey: string,
  entityId: string,
  acsUrl: { binding: string; url: string }
) => {
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
  });

  return { idp, sp };
};

export const buildSamlAppCallbackUrl = (baseUrl: URL, samlApplicationId: string) =>
  appendPath(baseUrl, `api/saml-applications/${samlApplicationId}/callback`).toString();
