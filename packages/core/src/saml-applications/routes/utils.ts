/* eslint-disable max-lines */
// TODO: refactor this file to reduce LOC
import { parseJson } from '@logto/connector-kit';
import { Prompt, QueryKey, ReservedScope, UserScope } from '@logto/js';
import { type SamlAcsUrl, BindingType } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { tryThat, appendPath, deduplicate } from '@silverhand/essentials';
import camelcaseKeys, { type CamelCaseKeys } from 'camelcase-keys';
import { XMLValidator } from 'fast-xml-parser';
import saml from 'samlify';
import { ZodError, z } from 'zod';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
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
import { buildSingleSignOnUrl, buildSamlIdentityProviderEntityId } from '../libraries/utils.js';
import { type SamlApplicationDetails } from '../queries/index.js';

type ValidSamlApplicationDetails = {
  secret: string;
  entityId: string;
  acsUrl: SamlAcsUrl;
  redirectUri: string;
  privateKey: string;
  certificate: string;
};

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

const validateSamlApplicationDetails = (
  details: SamlApplicationDetails
): ValidSamlApplicationDetails => {
  const {
    entityId,
    acsUrl,
    oidcClientMetadata: { redirectUris },
    privateKey,
    certificate,
    secret,
  } = details;

  assertThat(acsUrl, 'application.saml.acs_url_required');
  assertThat(entityId, 'application.saml.entity_id_required');
  assertThat(redirectUris[0], 'oidc.invalid_redirect_uri');

  assertThat(privateKey, 'application.saml.private_key_required');
  assertThat(certificate, 'application.saml.certificate_required');

  return {
    secret,
    entityId,
    acsUrl,
    redirectUri: redirectUris[0],
    privateKey,
    certificate,
  };
};

const buildLoginResponseTemplate = () => {
  return {
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
  };
};

const buildSamlIdentityProvider = ({
  entityId,
  certificate,
  singleSignOnUrl,
  privateKey,
}: {
  entityId: string;
  certificate: string;
  singleSignOnUrl: string;
  privateKey: string;
}): saml.IdentityProviderInstance => {
  // eslint-disable-next-line new-cap
  return saml.IdentityProvider({
    entityID: entityId,
    signingCert: certificate,
    singleSignOnService: [
      {
        Location: singleSignOnUrl,
        Binding: BindingType.Redirect,
      },
      {
        Location: singleSignOnUrl,
        Binding: BindingType.Post,
      },
    ],
    privateKey,
    isAssertionEncrypted: false,
    loginResponseTemplate: buildLoginResponseTemplate(),
    nameIDFormat: [
      saml.Constants.namespace.format.emailAddress,
      saml.Constants.namespace.format.persistent,
    ],
  });
};

const buildSamlServiceProvider = ({
  entityId,
  acsUrl,
  certificate,
  isWantAuthnRequestsSigned,
}: {
  entityId: string;
  acsUrl: SamlAcsUrl;
  certificate: string;
  isWantAuthnRequestsSigned: boolean;
}): saml.ServiceProviderInstance => {
  // eslint-disable-next-line new-cap
  return saml.ServiceProvider({
    entityID: entityId,
    assertionConsumerService: [
      {
        Binding: acsUrl.binding,
        Location: acsUrl.url,
      },
    ],
    signingCert: certificate,
    authnRequestsSigned: isWantAuthnRequestsSigned,
    allowCreate: false,
  });
};

export class SamlApplication {
  public details: ValidSamlApplicationDetails;

  protected tenantEndpoint: URL;
  protected oidcConfig?: CamelCaseKeys<OidcConfigResponse>;

  private _idp?: saml.IdentityProviderInstance;
  private _sp?: saml.ServiceProviderInstance;

  constructor(
    details: SamlApplicationDetails,
    protected samlApplicationId: string,
    protected issuer: string,
    tenantId: string
  ) {
    this.details = validateSamlApplicationDetails(details);
    this.tenantEndpoint = getTenantEndpoint(tenantId, EnvSet.values);
  }

  public get idp(): saml.IdentityProviderInstance {
    this._idp ||= buildSamlIdentityProvider(this.buildIdpConfig());
    return this._idp;
  }

  public get sp(): saml.ServiceProviderInstance {
    this._sp ||= buildSamlServiceProvider({
      ...this.buildSpConfig(),
      certificate: this.details.certificate,
      isWantAuthnRequestsSigned: this.idp.entityMeta.isWantAuthnRequestsSigned(),
    });
    return this._sp;
  }

  public get idPMetadata() {
    return this.idp.getMetadata();
  }

  public get idPCertificate() {
    return this.details.certificate;
  }

  public get samlAppCallbackUrl() {
    return appendPath(
      this.tenantEndpoint,
      `api/saml-applications/${this.samlApplicationId}/callback`
    ).toString();
  }

  public async parseLoginRequest(
    binding: 'post' | 'redirect',
    loginRequest: Parameters<typeof saml.IdentityProviderInstance.prototype.parseLoginRequest>[2]
  ) {
    return this.idp.parseLoginRequest(this.sp, binding, loginRequest);
  }

  public createSamlResponse = async (
    userInfo: IdTokenProfileStandardClaims
  ): Promise<{ context: string; entityEndpoint: string }> => {
    // TODO: fix binding method
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { context, entityEndpoint } = await this.idp.createLoginResponse(
      this.sp,
      // @ts-expect-error --fix request object later
      null,
      'post',
      userInfo,
      this.createSamlTemplateCallback(userInfo)
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { context, entityEndpoint };
  };

  // Helper functions for SAML callback
  public handleOidcCallbackAndGetUserInfo = async ({ code }: { code: string }) => {
    // Exchange authorization code for tokens
    const { accessToken } = await this.exchangeAuthorizationCode({
      code,
    });

    assertThat(accessToken, new RequestError('oidc.access_denied'));

    // Get user info using access token
    return this.getUserInfo({ accessToken });
  };

  public getSignInUrl = async ({ scope, state }: { scope?: string; state?: string }) => {
    const { authorizationEndpoint } = await this.fetchOidcConfig();

    const queryParameters = new URLSearchParams({
      [QueryKey.ClientId]: this.samlApplicationId,
      [QueryKey.RedirectUri]: this.details.redirectUri,
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

  protected getOidcConfig = async (): Promise<CamelCaseKeys<OidcConfigResponse>> => {
    const oidcConfig = await tryThat(
      async () => fetchOidcConfigRaw(this.issuer),
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

  protected exchangeAuthorizationCode = async ({ code }: { code: string }) => {
    const { tokenEndpoint } = await this.fetchOidcConfig();
    const result = await handleTokenExchange(tokenEndpoint, {
      code,
      clientId: this.samlApplicationId,
      clientSecret: this.details.secret,
      redirectUri: this.details.redirectUri,
    });

    if (!result.success) {
      throw new RequestError({
        code: 'oidc.invalid_token',
        message: 'Invalid token response',
      });
    }

    return camelcaseKeys(result.data);
  };

  protected async fetchOidcConfig() {
    this.oidcConfig ||= await this.getOidcConfig();

    return this.oidcConfig;
  }

  protected getUserInfo = async ({
    accessToken,
  }: {
    accessToken: string;
  }): Promise<IdTokenProfileStandardClaims & Record<string, unknown>> => {
    const { userinfoEndpoint } = await this.fetchOidcConfig();
    const body = await getRawUserInfoResponse(accessToken, userinfoEndpoint);
    const result = idTokenProfileStandardClaimsGuard
      .catchall(z.unknown())
      .safeParse(parseJson(body));

    if (!result.success) {
      throw new RequestError({
        code: 'oidc.invalid_request',
        message: 'Invalid user info response',
        details: result.error.flatten(),
      });
    }

    return result.data;
  };

  protected createSamlTemplateCallback =
    (user: IdTokenProfileStandardClaims) => (template: string) => {
      const assertionConsumerServiceUrl = this.sp.entityMeta.getAssertionConsumerService(
        saml.Constants.wording.binding.post
      );

      const { nameIDFormat } = this.idp.entitySetting;
      const { NameIDFormat, NameID } = buildSamlAssertionNameId(user, nameIDFormat);

      const id = `ID_${generateStandardId()}`;
      const now = new Date();
      const expireAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes later

      const tagValues = {
        ID: id,
        AssertionID: `ID_${generateStandardId()}`,
        Destination: assertionConsumerServiceUrl,
        Audience: this.sp.entityMeta.getEntityID(),
        EntityID: this.sp.entityMeta.getEntityID(),
        SubjectRecipient: assertionConsumerServiceUrl,
        Issuer: this.idp.entityMeta.getEntityID(),
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

  private buildIdpConfig() {
    return {
      entityId: buildSamlIdentityProviderEntityId(this.tenantEndpoint, this.samlApplicationId),
      privateKey: this.details.privateKey,
      certificate: this.details.certificate,
      singleSignOnUrl: buildSingleSignOnUrl(this.tenantEndpoint, this.samlApplicationId),
    };
  }

  private buildSpConfig() {
    return {
      entityId: this.details.entityId,
      acsUrl: this.details.acsUrl,
    };
  }
}

/**
 * Determines the SAML NameID format and value based on the user's claims and IdP's NameID format.
 * Supports email and persistent formats.
 *
 * @param user - The user's standard claims
 * @param idpNameIDFormat - The NameID format(s) specified by the IdP (optional)
 * @returns An object containing the NameIDFormat and NameID
 */
export const buildSamlAssertionNameId = (
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
/* eslint-enable max-lines */
