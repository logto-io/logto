# OIDC standard connector

The official Logto connector for OIDC protocol.

**Table of contents**

- [Get started](#get-started)
- [Create your OIDC app](#create-your-oidc-app)
- [Configure your connector](#configure-your-connector)
- [Config types](#config-types)
- [General settings](#general-settings)
- [Utilize the OIDC connector](#utilize-the-oidc-connector)
- [Manage user's social identity](#manage-users-social-identity)

## Get started

The OIDC connector enables Logto's connection to an arbitrary social identity provider that supports OIDC protocol. Use the OIDC connector to let your application:

- Add social sign-in buttons
- Link user accounts to social identities
- Sync user profile info from the social provider
- Access third-party APIs through secure token storage in Logto [Secret Vault](https://docs.logto.io/secret-vault) for automation tasks (e.g., editing Google Docs, managing Calendar events in your app)

**Note**: OIDC connector is a special kind of connector in Logto, you can add multiple OIDC-protocol-based connectors.

## Create your OIDC app

When you open this page, we believe you already know which social identity provider you want to connect to. The first thing to do is to confirm that the identity provider supports the OIDC protocol, which is a prerequisite for configuring a valid connector. Then, follow the identity provider's instructions to register and create the relevant app for OIDC authorization.

## Configure your connector

We ONLY support "Authorization Code" grant type for security consideration and it can perfectly fit Logto's scenario.

`clientId` and `clientSecret` can be found at your OIDC apps details page.

*clientId*: The client ID is a unique identifier that identifies the client application during registration with the authorization server. This ID is used by the authorization server to verify the identity of the client application and to associate any authorized access tokens with that specific client application.

*clientSecret*: The client secret is a confidential key that is issued to the client application by the authorization server during registration. The client application uses this secret key to authenticate itself with the authorization server when requesting access tokens. The client secret is considered confidential information and should be kept secure at all times.

*tokenEndpointAuthMethod*: The token endpoint authentication method is used by the client application to authenticate itself with the authorization server when requesting access tokens. To discover supported methods, consult the `token_endpoint_auth_methods_supported` field available at the OAuth 2.0 service provider’s OpenID Connect discovery endpoint, or refer to the relevant documentation provided by the OAuth 2.0 service provider.

*clientSecretJwtSigningAlgorithm (Optional)*: Only required when `tokenEndpointAuthMethod` is `client_secret_jwt`. The client secret JWT signing algorithm is used by the client application to sign the JWT that is sent to the authorization server during the token request.

*scope*: The scope parameter is used to specify the set of resources and permissions that the client application is requesting access to. The scope parameter is typically defined as a space-separated list of values that represent specific permissions. For example, a scope value of "read write" might indicate that the client application is requesting read and write access to a user's data.

You are expected to find `authorizationEndpoint`, `tokenEndpoint`, `jwksUri` and `issuer` as OpenID Provider's configuration information. They should be available in social vendor's documentation.

*authenticationEndpoint*: This endpoint is used to initiate the authentication process. The authentication process typically involves the user logging in and granting authorization for the client application to access their resources.

*tokenEndpoint*: This endpoint is used by the client application to obtain an id token that can be used to access the requested resources. The client application typically sends a request to the token endpoint with a grant type and authorization code to receive an id token.

*jwksUri*: This is the URL endpoint where the JSON Web Key Set (JWKS) of the social identity provider (IdP for short) can be obtained. The JWKS is a set of cryptographic keys that the IdP uses to sign and verify JSON Web Tokens (JWTs) that are issued during the authentication process. The `jwksUri` is used by the relying party (RP) to obtain the public keys used by the IdP to sign the JWTs, so the RP can verify the authenticity and integrity of the JWTs received from the IdP.

*issuer*: This is the unique identifier of the IdP that is used by the RP to verify the JWTs received from the IdP. It is included in the JWTs as the `iss` [claim](https://www.rfc-editor.org/rfc/rfc7519#section-4) (Id token is always a JWT). The issuer value should match the URL of the IdP's authorization server, and it should be a URI that the RP trusts. When the RP receives a JWT, it checks the `iss` claim to ensure that it was issued by a trusted IdP, and that the JWT is intended for use with the RP.

Together, `jwksUri` and `issuer` provide a secure mechanism for the RP to verify the identity of the end-user during the authentication process. By using the public keys obtained from the `jwksUri`, the RP can verify the authenticity and integrity of the JWTs issued by the IdP. The issuer value ensures that the RP only accepts JWTs that were issued by a trusted IdP, and that the JWTs are intended for use with the RP.

Since an authentication request is always required, an `authRequestOptionalConfig` is provided to wrap all optional configs, you can find details on [OIDC Authentication Request](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest). You may also find that `nonce` is missing in this config. Since `nonce` should identical for each request, we put the generation of `nonce` in code implementation. So do not worry about it! Previously mentioned `jwksUri` and `issuer` are also included in `idTokenVerificationConfig`.

You may be curious as to why a standard OIDC protocol supports both the implicit and hybrid flows, yet the Logto connector only supports the authorization flow. It has been determined that the implicit and hybrid flows are less secure than the authorization flow. Due to Logto's focus on security, it only supports the authorization flow for the highest level of security for its users, despite its slightly less convenient nature.

`responseType` and `grantType` can ONLY be FIXED values with "Authorization Code" flow, so we make them optional and default values will be automatically filled.

**Note**:
For all flow types, we provided an OPTIONAL `customConfig` key to put your customize parameters.
Each social identity provider could have their own variant on OIDC standard protocol. If your desired social identity provider strictly stick to OIDC standard protocol, the you do not need to care about `customConfig`.

## Config types

| Name                                | Type                                | Required  |
|-------------------------------------|-------------------------------------|-----------|
| scope                               | string                              | True      |
| clientId                            | string                              | True      |
| clientSecret                        | string                              | True      |
| authorizationEndpoint               | string                              | True      |
| tokenEndpoint                       | string                              | True      |
| idTokenVerificationConfig           | IdTokenVerificationConfig           | True      |
| authRequestOptionalConfig | AuthRequestOptionalConfig | False     |
| customConfig                        | Record<string, string>              | False     |


| AuthRequestOptionalConfig properties | Type   | Required |
|------------------------------------------------|--------|----------|
| responseType                                   | string | False    |
| tokenEndpoint                                  | string | False    |
| responseMode                                   | string | False    |
| display                                        | string | False    |
| prompt                                         | string | False    |
| maxAge                                         | string | False    |
| uiLocales                                      | string | False    |
| idTokenHint                                    | string | False    |
| loginHint                                      | string | False    |
| acrValues                                      | string | False    |


| IdTokenVerificationConfig properties | Type                              | Required |
|--------------------------------------|-----------------------------------|----------|
| jwksUri                              | string                            | True     |
| issuer                               | string \| string[]                | False    |
| audience                             | string \| string[]                | False    |
| algorithms                           | string[]                          | False    |
| clockTolerance                       | string \| number                  | False    |
| crit                                 | Record<string, string \| boolean> | False    |
| currentDate                          | Date                              | False    |
| maxTokenAge                          | string \| number                  | False    |
| subject                              | string                            | False    |
| typ                                  | string                            | False    |

See [here](https://github.com/panva/jose/blob/main/docs/interfaces/jwt_verify.JWTVerifyOptions.md) to find more details about `IdTokenVerificationConfig`.

## General settings

Here are some general settings that won't block the connection to your identity provider but may affect the end-user authentication experience.

### Social button name and logo

If you want to display a social button on your login page, you can set the **name** and **logo** (dark mode and light mode) of the social identity provider. This will help users recognize the social login option.

### Identity provider name

Each social connector has a unique Identity Provider (IdP) name to differentiate user identities. While common connectors use a fixed IdP name, custom connectors require a unique value. Learn more about [IdP names](https://docs.logto.io/connectors/connector-data-structure#target-identity-provider-name) for more details.

### Sync profile information

In the OIDC connector, you can set the policy for syncing profile information, such as user names and avatars. Choose from:

- **Only sync at sign-up**: Profile info is fetched once when the user first signs in.
- **Always sync at sign-in**: Profile info is updated every time the user signs in.

### Store tokens to access third-party APIs (Optional)

If you want to access the Identity Provider's APIs and perform actions with user authorization (whether via social sign-in or account linking), Logto needs to get specific API scopes and store tokens.

1. Add the required scopes in the **scope** field following the instructions above
2. Enable **Store tokens for persistent API access** in the Logto OIDC connector. Logto will securely [store access tokens](https://docs.logto.io/secret-vault/federated-token-set) in the Secret Vault.
3. For **standard** OAuth/OIDC identity providers, the `offline_access` scope must be included to obtain a refresh token, preventing repeated user consent prompts.

## Utilize the OIDC connector

Once you've created an OIDC connector and connected it to your identity provider, you can incorporate it into your end-user flows. Choose the options that match your needs:

### Enable social sign-in button

1. In Logto Console, go to [Sign-in experience > Sign-up and sign-in](https://cloud.logto.io/to/sign-in-experience/sign-up-and-sign-in).
2. Add the OIDC connector under **Social sign-in** section to let users authenticate with your identity provider.

Learn more about [social sign-in experience](https://docs.logto.io/end-user-flows/sign-up-and-sign-in/social-sign-in).

### Link or unlink a social account

Use the Account API to build a custom Account Center in your app that lets signed-in users link or unlink their social accounts. [Follow the Account API tutorial](https://docs.logto.io/end-user-flows/account-settings/by-account-api#link-a-new-social-connection)

**Tip**: It's allowed to enable the OIDC connector only for account linking and API access, without enabling it for social sign-in.

### Access identity provider APIs and perform actions

Your application can retrieve stored access tokens from the Secret Vault to call your identity provider's APIs and automate backend tasks. The specific capabilities depend on your identity provider and the scopes you've requested. [Refer to the guide](https://docs.logto.io/secret-vault/federated-token-set/token-retrieval) on retrieving stored tokens for API access.

## Manage user's social identity

After a user links their social account, admins can manage that connection in the Logto Console:

1. Navigate to [Logto console > User management](https://cloud.logto.io/to/users) and open the user's profile.
2. Under **Social connections**, locate the identity provider item and click **Manage**.
3. On this page, admins can manage the user's social connection, see all profile information granted and synced from their social account, and check the [access token status](https://docs.logto.io/secret-vault/federated-token-set/token-status).

**Note**: A few Identity Provider access token response does not include the specific scope information, so Logto cannot directly display the list of permissions granted by the user. However, as long as the user has consented to the requested scopes during authorization, your application will have the corresponding permissions when accessing the OIDC API.
