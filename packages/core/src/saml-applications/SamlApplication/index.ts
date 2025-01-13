/* eslint-disable max-lines */
// TODO: refactor this file to reduce LOC
import { parseJson } from '@logto/connector-kit';
import { userClaims, type UserClaim, UserScope, ReservedScope } from '@logto/core-kit';
import { Prompt, QueryKey } from '@logto/js';
import {
  type SamlAcsUrl,
  BindingType,
  NameIdFormat,
  type SamlEncryption,
  type SamlAttributeMapping,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { tryThat, type Nullable, cond } from '@silverhand/essentials';
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

import { buildSamlAssertionNameId, getSamlAppCallbackUrl } from './utils.js';

type ValidSamlApplicationDetails = {
  secret: string;
  entityId: string;
  acsUrl: SamlAcsUrl;
  redirectUri: string;
  privateKey: string;
  certificate: string;
  attributeMapping: SamlAttributeMapping;
  nameIdFormat: NameIdFormat;
  encryption: Nullable<SamlEncryption>;
};

type SamlIdentityProviderConfig = {
  entityId: string;
  certificate: string;
  singleSignOnUrl: string;
  privateKey: string;
  nameIdFormat: NameIdFormat;
  encryptSamlAssertion: boolean;
};

type SamlServiceProviderConfig = {
  entityId: string;
  acsUrl: SamlAcsUrl;
  certificate?: string;
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
    nameIdFormat,
    encryption,
    attributeMapping,
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
    nameIdFormat,
    encryption,
    attributeMapping,
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
  nameIdFormat,
  encryptSamlAssertion,
}: SamlIdentityProviderConfig): saml.IdentityProviderInstance => {
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
    isAssertionEncrypted: encryptSamlAssertion,
    loginResponseTemplate: buildLoginResponseTemplate(),
    nameIDFormat: [nameIdFormat],
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
    const { certificate: encryptCert, ...rest } = this.buildSpConfig();
    this._sp ||= buildSamlServiceProvider({
      ...rest,
      certificate: this.details.certificate,
      isWantAuthnRequestsSigned: this.idp.entityMeta.isWantAuthnRequestsSigned(),
      ...cond(encryptCert && { encryptCert }),
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
    return getSamlAppCallbackUrl(this.tenantEndpoint, this.samlApplicationId).toString();
  }

  public async parseLoginRequest(
    binding: 'post' | 'redirect',
    loginRequest: Parameters<typeof saml.IdentityProviderInstance.prototype.parseLoginRequest>[2]
  ) {
    return this.idp.parseLoginRequest(this.sp, binding, loginRequest);
  }

  public createSamlResponse = async ({
    userInfo,
    relayState,
    samlRequestId,
  }: {
    userInfo: IdTokenProfileStandardClaims;
    relayState: Nullable<string>;
    samlRequestId: Nullable<string>;
  }): Promise<{ context: string; entityEndpoint: string }> => {
    // TODO: fix binding method
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { context, entityEndpoint } = await this.idp.createLoginResponse(
      this.sp,
      // @ts-expect-error --fix request object later
      null,
      'post',
      userInfo,
      this.createSamlTemplateCallback({ userInfo, samlRequestId }),
      this.details.encryption?.encryptThenSign,
      relayState ?? undefined
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

  public getSignInUrl = async ({ state }: { state?: string }) => {
    const { authorizationEndpoint } = await this.fetchOidcConfig();

    const queryParameters = new URLSearchParams({
      [QueryKey.ClientId]: this.samlApplicationId,
      [QueryKey.RedirectUri]: this.details.redirectUri,
      [QueryKey.ResponseType]: 'code',
      [QueryKey.Prompt]: Prompt.Login,
    });

    queryParameters.append(
      QueryKey.Scope,
      // For security reasons, DO NOT include the offline_access scope by default.
      this.getScopesFromAttributeMapping().join(' ')
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

  // Get required scopes based on attribute mapping configuration
  protected getScopesFromAttributeMapping = (): Array<UserScope | ReservedScope> => {
    const requiredScopes = new Set<UserScope | ReservedScope>();

    // Add default scopes.
    requiredScopes.add(ReservedScope.OpenId);
    requiredScopes.add(UserScope.Profile);

    if (this.details.nameIdFormat === NameIdFormat.EmailAddress) {
      requiredScopes.add(UserScope.Email);
    }

    // If no attribute mapping, return empty array
    if (Object.keys(this.details.attributeMapping).length === 0) {
      return Array.from(requiredScopes);
    }

    // Iterate through all claims in attribute mapping
    // eslint-disable-next-line no-restricted-syntax
    for (const claim of Object.keys(this.details.attributeMapping) as Array<
      keyof SamlAttributeMapping
    >) {
      // Ignore `id` claim since this will always be included.
      if (claim === 'id') {
        continue;
      }

      // Find which scope includes this claim
      // eslint-disable-next-line no-restricted-syntax
      for (const [scope, claims] of Object.entries(userClaims) as Array<[UserScope, UserClaim[]]>) {
        if (claims.includes(claim)) {
          requiredScopes.add(scope);
          break;
        }
      }
    }

    return Array.from(requiredScopes);
  };

  protected createSamlTemplateCallback =
    ({
      userInfo,
      samlRequestId,
    }: {
      userInfo: IdTokenProfileStandardClaims;
      samlRequestId: Nullable<string>;
    }) =>
    (template: string) => {
      const assertionConsumerServiceUrl = this.sp.entityMeta.getAssertionConsumerService(
        saml.Constants.wording.binding.post
      );

      const { nameIDFormat } = this.idp.entitySetting;
      assertThat(nameIDFormat, 'application.saml.name_id_format_required');
      const { NameIDFormat, NameID } = buildSamlAssertionNameId(userInfo, nameIDFormat);

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
        InResponseTo: samlRequestId ?? 'null',
        /**
         * User attributes for SAML response
         *
         * @todo Support custom attribute mapping
         * @see {@link https://github.com/tngan/samlify/blob/master/src/libsaml.ts#L275-L300|samlify implementation}
         *
         * @remarks
         * By examining the code provided in the link above, we can define all the attributes supported by the attribute mapping here. Only the attributes defined in the `loginResponseTemplate.attributes` added when creating the IdP instance will appear in the SAML response.
         */
        attrSub: userInfo.sub,
        attrEmail: userInfo.email,
        attrName: userInfo.name,
      };

      const context = saml.SamlLib.replaceTagsByValue(template, tagValues);

      return {
        id,
        context,
      };
    };

  private buildIdpConfig(): SamlIdentityProviderConfig {
    return {
      entityId: buildSamlIdentityProviderEntityId(this.tenantEndpoint, this.samlApplicationId),
      privateKey: this.details.privateKey,
      certificate: this.details.certificate,
      singleSignOnUrl: buildSingleSignOnUrl(this.tenantEndpoint, this.samlApplicationId),
      nameIdFormat: this.details.nameIdFormat,
      encryptSamlAssertion: this.details.encryption?.encryptAssertion ?? false,
    };
  }

  private buildSpConfig(): SamlServiceProviderConfig {
    return {
      entityId: this.details.entityId,
      acsUrl: this.details.acsUrl,
      certificate: this.details.encryption?.certificate,
    };
  }
}
/* eslint-enable max-lines */
