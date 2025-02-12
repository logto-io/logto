/* eslint-disable max-lines */
// TODO: refactor this file to reduce LOC
import { parseJson } from '@logto/connector-kit';
import { userClaims, type UserClaim, UserScope, ReservedScope } from '@logto/core-kit';
import { Prompt, QueryKey } from '@logto/js';
import {
  type SamlAcsUrl,
  BindingType,
  NameIdFormat,
  type SamlAttributeMapping,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { cond, tryThat, type Nullable } from '@silverhand/essentials';
import camelcaseKeys, { type CamelCaseKeys } from 'camelcase-keys';
import { XMLValidator } from 'fast-xml-parser';
import saml from 'samlify';
import { ZodError, z } from 'zod';

import { type EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import {
  buildSingleSignOnUrl,
  buildSamlIdentityProviderEntityId,
} from '#src/libraries/saml-application/utils.js';
import { type SamlApplicationDetails } from '#src/queries/saml-application/index.js';
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
} from './consts.js';
import {
  buildSamlAssertionNameId,
  getSamlAppCallbackUrl,
  generateSamlAttributeTag,
} from './utils.js';

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

class SamlApplicationConfig {
  constructor(private readonly _details: SamlApplicationDetails) {}

  public get secret() {
    return this._details.secret;
  }

  public get entityId() {
    assertThat(this._details.entityId, 'application.saml.entity_id_required');
    return this._details.entityId;
  }

  public get acsUrl() {
    assertThat(this._details.acsUrl, 'application.saml.acs_url_required');
    return this._details.acsUrl;
  }

  public get redirectUri() {
    assertThat(this._details.oidcClientMetadata.redirectUris[0], 'oidc.invalid_redirect_uri');
    return this._details.oidcClientMetadata.redirectUris[0];
  }

  public get privateKey() {
    assertThat(this._details.privateKey, 'application.saml.private_key_required');
    return this._details.privateKey;
  }

  public get certificate() {
    assertThat(this._details.certificate, 'application.saml.certificate_required');
    return this._details.certificate;
  }

  public get nameIdFormat() {
    return this._details.nameIdFormat;
  }

  public get encryption() {
    return this._details.encryption;
  }

  public get attributeMapping() {
    return this._details.attributeMapping;
  }
}

export class SamlApplication {
  public config: SamlApplicationConfig;

  protected endpoint: URL;
  protected issuer: string;
  protected oidcConfig?: CamelCaseKeys<OidcConfigResponse>;

  private _idp?: saml.IdentityProviderInstance;
  private _sp?: saml.ServiceProviderInstance;

  constructor(
    details: SamlApplicationDetails,
    protected samlApplicationId: string,
    protected envSet: EnvSet
  ) {
    this.config = new SamlApplicationConfig(details);
    this.issuer = envSet.oidc.issuer;
    this.endpoint = envSet.endpoint;
  }

  public get idp(): saml.IdentityProviderInstance {
    this._idp ||= this.buildSamlIdentityProvider();
    this.setSchemaValidator();
    return this._idp;
  }

  public get sp(): saml.ServiceProviderInstance {
    this._sp ||= this.buildSamlServiceProvider();
    this.setSchemaValidator();
    return this._sp;
  }

  public get idPMetadata() {
    return this.idp.getMetadata();
  }

  public get idPCertificate() {
    return this.config.certificate;
  }

  public get samlAppCallbackUrl() {
    return getSamlAppCallbackUrl(this.endpoint, this.samlApplicationId).toString();
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
      this.config.encryption?.encryptThenSign,
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
      [QueryKey.RedirectUri]: this.config.redirectUri,
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

  protected buildSamlIdentityProvider = (): saml.IdentityProviderInstance => {
    const {
      entityId,
      certificate,
      singleSignOnUrl,
      privateKey,
      nameIdFormat,
      encryptSamlAssertion,
    } = this.buildIdpConfig();
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
      loginResponseTemplate: this.buildLoginResponseTemplate(),
      nameIDFormat: [nameIdFormat],
    });
  };

  protected buildSamlServiceProvider = (): saml.ServiceProviderInstance => {
    const { certificate: encryptCert, entityId, acsUrl } = this.buildSpConfig();
    // eslint-disable-next-line new-cap
    return saml.ServiceProvider({
      entityID: entityId,
      assertionConsumerService: [
        {
          Binding: acsUrl.binding,
          Location: acsUrl.url,
        },
      ],
      signingCert: this.config.certificate,
      authnRequestsSigned: this.idp.entityMeta.isWantAuthnRequestsSigned(),
      allowCreate: false,
      ...cond(encryptCert && { encryptCert }),
    });
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
      clientSecret: this.config.secret,
      redirectUri: this.config.redirectUri,
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

    if (this.config.nameIdFormat === NameIdFormat.EmailAddress) {
      requiredScopes.add(UserScope.Email);
    }

    // If no attribute mapping, return empty array
    if (Object.keys(this.config.attributeMapping).length === 0) {
      return Array.from(requiredScopes);
    }

    // Iterate through all claims in attribute mapping
    // eslint-disable-next-line no-restricted-syntax
    for (const claim of Object.keys(this.config.attributeMapping) as Array<
      keyof SamlAttributeMapping
    >) {
      // Ignore `sub` claim since this will always be included.
      if (claim === 'sub') {
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
        // Keep the `attrSub`, `attrEmail` and `attrName` attributes since attribute mapping can be empty.
        attrSub: userInfo.sub,
        attrEmail: userInfo.email,
        attrName: userInfo.name,
        ...this.buildSamlAttributesTagValues(userInfo),
      };

      const context = saml.SamlLib.replaceTagsByValue(template, tagValues);

      return {
        id,
        context,
      };
    };

  protected readonly buildLoginResponseTemplate = () => {
    return {
      context: samlLogInResponseTemplate,
      attributes: Object.values(this.config.attributeMapping).map((value) => ({
        name: value,
        valueTag: value,
        nameFormat: samlAttributeNameFormatBasic,
        valueXsiType: samlValueXmlnsXsi.string,
      })),
    };
  };

  protected readonly buildSamlAttributesTagValues = (
    userInfo: IdTokenProfileStandardClaims
  ): Record<string, string> => {
    return Object.fromEntries(
      Object.entries(this.config.attributeMapping)
        .map(([key, value]) => {
          // eslint-disable-next-line no-restricted-syntax
          return [value, userInfo[key as keyof IdTokenProfileStandardClaims] ?? null] as [
            string,
            unknown,
          ];
        })
        .map(([key, value]) => [
          generateSamlAttributeTag(key),
          typeof value === 'object' ? JSON.stringify(value) : String(value),
        ])
    );
  };

  // Used to check whether xml content is valid in format.
  private setSchemaValidator() {
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
  }

  private buildIdpConfig(): SamlIdentityProviderConfig {
    return {
      entityId: buildSamlIdentityProviderEntityId(this.endpoint, this.samlApplicationId),
      privateKey: this.config.privateKey,
      certificate: this.config.certificate,
      singleSignOnUrl: buildSingleSignOnUrl(this.endpoint, this.samlApplicationId),
      nameIdFormat: this.config.nameIdFormat,
      encryptSamlAssertion: this.config.encryption?.encryptAssertion ?? false,
    };
  }

  private buildSpConfig(): SamlServiceProviderConfig {
    return {
      entityId: this.config.entityId,
      acsUrl: this.config.acsUrl,
      certificate: this.config.encryption?.certificate,
    };
  }
}
/* eslint-enable max-lines */
