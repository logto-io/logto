# OAuth standard connector

The official Logto connector for OAuth 2.0 protocol.

## Get started

The OAuth connector enables Logto's connection to an arbitrary social identity provider that supports OAuth 2.0 protocol.

> ℹ️ **Note**
> 
> OAuth connector is a special kind of connector in Logto, you can add a few OAuth-protocol-based connectors.

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

Logto also provide a `profileMap` field that users can customize the mapping from the social vendors' profiles which are usually not standard. The keys are Logto's standard user profile field names and corresponding values should be social profiles' field names. In current stage, Logto only concern 'id', 'name', 'avatar', 'email' and 'phone' from social profile, only 'id' is required and others are optional fields.

`responseType` and `grantType` can ONLY be FIXED values with authorization code grant type, so we make them optional and default values will be automatically filled.

For example, you can find [Google user profile response](https://developers.google.com/identity/openid-connect/openid-connect#an-id-tokens-payload) and hence its `profileMap` should be like:

```json
{
  "id": "sub",
  "avatar": "picture"
}
```

> ℹ️ **Note**
> 
> We provided an OPTIONAL `customConfig` key to put your customize parameters.
> Each social identity provider could have their own variant on OAuth standard protocol. If your desired social identity provider strictly stick to OAuth standard protocol, the you do not need to care about `customConfig`.

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

## Reference

* [The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
