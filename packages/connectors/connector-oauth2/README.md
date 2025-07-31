# OAuth standard connector

The official Logto connector for OAuth 2.0 protocol.

## Table of contents

- [Get started](#get-started)
- [Create your OAuth app](#create-your-oauth-app)
- [Configure your connector](#configure-your-connector)
- [Config types](#config-types)
- [General settings](#general-settings)
- [Utilize the OAuth connector](#utilize-the-oauth-connector)
- [Manage user's social identity](#manage-users-social-identity)
- [Reference](#reference)

## Get started

The OAuth connector enables Logto's connection to an arbitrary social identity provider that supports OAuth 2.0 protocol. Use the OAuth connector to let your application:

- Add social sign-in buttons
- Link user accounts to social identities
- Sync user profile info from the social provider
- Access third-party APIs through secure token storage in Logto [Secret Vault](https://docs.logto.io/secret-vault) for automation tasks (e.g., editing Google Docs, managing Calendar events in your app)

**Note**: OAuth connector is a special kind of connector in Logto, you can add multiple OAuth-protocol-based connectors.

## Create your OAuth app

When you open this page, we believe you already know which social identity provider you want to connect to. The first thing to do is to confirm that the identity provider supports the OAuth protocol, which is a prerequisite for configuring a valid connector. Then, follow the identity provider's instructions to register and create the relevant app for OAuth authorization.

## Configure your connector

We ONLY support "Authorization Code" grant type for security consideration and it can perfectly fit Logto's scenario.

`clientId` and `clientSecret` can be found at your OAuth apps details page.

*clientId*: The client ID is a unique identifier that identifies the client application during registration with the authorization server. This ID is used by the authorization server to verify the identity of the client application and to associate any authorized access tokens with that specific client application.

*clientSecret*: The client secret is a confidential key that is issued to the client application by the authorization server during registration. The client application uses this secret key to authenticate itself with the authorization server when requesting access tokens. The client secret is considered confidential information and should be kept secure at all times.

*tokenEndpointAuthMethod*: The token endpoint authentication method is used by the client application to authenticate itself with the authorization server when requesting access tokens. To discover supported methods, consult the `token_endpoint_auth_methods_supported` field available at the OAuth 2.0 service provider’s OpenID Connect discovery endpoint, or refer to the relevant documentation provided by the OAuth 2.0 service provider.

*clientSecretJwtSigningAlgorithm (Optional)*: Only required when `tokenEndpointAuthMethod` is `client_secret_jwt`. The client secret JWT signing algorithm is used by the client application to sign the JWT that is sent to the authorization server during the token request.

*scope*: The scope parameter is used to specify the set of resources and permissions that the client application is requesting access to. The scope parameter is typically defined as a space-separated list of values that represent specific permissions. For example, a scope value of "read write" might indicate that the client application is requesting read and write access to a user's data.

You are expected to find `authorizationEndpoint`, `tokenEndpoint` and `userInfoEndpoint` in social vendor's documentation.

*authenticationEndpoint*: This endpoint is used to initiate the authentication process. The authentication process typically involves the user logging in and granting authorization for the client application to access their resources.

*tokenEndpoint*: This endpoint is used by the client application to obtain an access token that can be used to access the requested resources. The client application typically sends a request to the token endpoint with a grant type and authorization code to receive an access token.

*userInfoEndpoint*: This endpoint is used by the client application to obtain additional information about the user, such as their fullname, email address or profile picture. The user info endpoint is typically accessed after the client application has obtained an access token from the token endpoint.

Logto also provides a `profileMap` field that users can customize the mapping from the social vendors' profiles which are usually not standard. The keys are Logto's standard user profile field names and corresponding values should be social profiles' field names. In the current stage, Logto only concerns 'id', 'name', 'avatar', 'email', and 'phone' from social profiles, only 'id' is required and others are optional fields.

### Nested Attributes

The `profileMap` also supports nested attributes. You can map nested properties from the social vendor's profile to Logto's standard user profile fields.

For example, if the social vendor's profile has nested attributes like the following:
```json
{
  "id": "123456",
  "contact": {
    "email": "octcat@github.com",
    "phone": "123-456-7890"
  },
  "details": {
    "name": "Oct Cat",
    "avatar": {
      "url": "avatar.png"
    },
    "groups": ["group1", "group2", "group3"]
  }
}
```
You can configure the `profileMap` like this:
```json
{
  "id": "id",
  "name": "details.name",
  "avatar": "details.avatar.url",
  "email": "contact.email",
  "phone": "contact.phone"
}
```
In this example, `details.name`, `details.avatar.url`, `contact.email`, and `contact.phone` are nested attributes in the social vendor's profile.

**Note**:
We provided an OPTIONAL `customConfig` key to put your customize parameters.
Each social identity provider could have their own variant on OAuth standard protocol. If your desired social identity provider strictly stick to OAuth standard protocol, the you do not need to care about `customConfig`.

## Config types

| Name                      | Type                   | Required |
|---------------------------|------------------------|----------|
| authorizationEndpoint     | string                 | true     |
| userInfoEndpoint          | string                 | true     |
| clientId                  | string                 | true     |
| clientSecret              | string                 | true     |
| tokenEndpointResponseType | enum                   | false    |
| responseType              | string                 | false    |
| grantType                 | string                 | false    |
| tokenEndpoint             | string                 | false    |
| scope                     | string                 | false    |
| customConfig              | Record<string, string> | false    |
| profileMap                | ProfileMap             | false    |

| ProfileMap fields | Type   | Required | Default value |
|-------------------|--------|----------|---------------|
| id                | string | false    | id            |
| name              | string | false    | name          |
| avatar            | string | false    | avatar        |
| email             | string | false    | email         |
| phone             | string | false    | phone         |

## General settings

Here are some general settings that won't block the connection to your identity provider but may affect the end-user authentication experience.

### Social button name and logo

If you want to display a social button on your login page, you can set the **name** and **logo** (dark mode and light mode) of the social identity provider. This will help users recognize the social login option.

### Identity provider name

Each social connector has a unique Identity Provider (IdP) name to differentiate user identities. While common connectors use a fixed IdP name, custom connectors require a unique value. Learn more about [IdP names](https://docs.logto.io/connectors/connector-data-structure#target-identity-provider-name) for more details.

### Sync profile information

In the OAuth connector, you can set the policy for syncing profile information, such as user names and avatars. Choose from:

- **Only sync at sign-up**: Profile info is fetched once when the user first signs in.
- **Always sync at sign-in**: Profile info is updated every time the user signs in.

### Store tokens to access third-party APIs (Optional)

If you want to access the Identity Provider's APIs and perform actions with user authorization (whether via social sign-in or account linking), Logto needs to get specific API scopes and store tokens.

1. Add the required scopes in the **scope** field following the instructions above
2. Enable **Store tokens for persistent API access** in the Logto OAuth connector. Logto will securely [store access tokens](https://docs.logto.io/secret-vault/federated-token-set) in the Secret Vault.
3. For **standard** OAuth/OIDC identity providers, the `offline_access` scope must be included to obtain a refresh token, preventing repeated user consent prompts.

## Utilize the OAuth connector

Once you've created an OAuth connector and connected it to your identity provider, you can incorporate it into your end-user flows. Choose the options that match your needs:

### Enable social sign-in button

1. In Logto Console, go to [Sign-in experience > Sign-up and sign-in](https://cloud.logto.io/to/sign-in-experience/sign-up-and-sign-in).
2. Add the OAuth connector under **Social sign-in** section to let users authenticate with your identity provider.

Learn more about [social sign-in experience](https://docs.logto.io/end-user-flows/sign-up-and-sign-in/social-sign-in).

### Link or unlink a social account

Use the Account API to build a custom Account Center in your app that lets signed-in users link or unlink their social accounts. [Follow the Account API tutorial](https://docs.logto.io/end-user-flows/account-settings/by-account-api#link-a-new-social-connection)

**Tip**: It's allowed to enable the OAuth connector only for account linking and API access, without enabling it for social sign-in.

### Access identity provider APIs and perform actions

Your application can retrieve stored access tokens from the Secret Vault to call your identity provider's APIs and automate backend tasks. The specific capabilities depend on your identity provider and the scopes you've requested. [Refer to the guide](https://docs.logto.io/secret-vault/federated-token-set/token-retrieval) on retrieving stored tokens for API access.

## Manage user's social identity

After a user links their social account, admins can manage that connection in the Logto Console:

1. Navigate to [Logto console > User management](https://cloud.logto.io/to/users) and open the user's profile.
2. Under **Social connections**, locate the identity provider item and click **Manage**.
3. On this page, admins can manage the user's social connection, see all profile information granted and synced from their social account, and check the [access token status](https://docs.logto.io/secret-vault/federated-token-set/token-status).

**Note**: A few Identity Provider access token response does not include the specific scope information, so Logto cannot directly display the list of permissions granted by the user. However, as long as the user has consented to the requested scopes during authorization, your application will have the corresponding permissions when accessing the OAuth API.

## Reference

* [The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
