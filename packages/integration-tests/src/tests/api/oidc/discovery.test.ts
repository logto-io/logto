import ky from 'ky';

import { discoveryUrl, logtoUrl } from '#src/constants.js';

const normalizeEndpoint = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.replaceAll(logtoUrl, '<logto-url>');
  }

  if (Array.isArray(value)) {
    return value.map((nestedValue) => normalizeEndpoint(nestedValue));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeEndpoint(nestedValue)])
    );
  }

  return value;
};

describe('OIDC discovery', () => {
  /**
   * The snapshot assumes the default database seed, which generates an EC signing key and thus
   * advertises `ES384`. An instance seeded with an RSA signing key reports different
   * `id_token_signing_alg_values_supported` and fails this snapshot.
   */
  it('exposes the reviewed provider metadata', async () => {
    const discovery = await ky.get(discoveryUrl).json();

    expect(normalizeEndpoint(discovery)).toMatchInlineSnapshot(`
      {
        "authorization_endpoint": "<logto-url>/oidc/auth",
        "authorization_response_iss_parameter_supported": true,
        "backchannel_logout_session_supported": true,
        "backchannel_logout_supported": true,
        "claim_types_supported": [
          "normal",
        ],
        "claims_parameter_supported": false,
        "claims_supported": [
          "sub",
          "name",
          "family_name",
          "given_name",
          "middle_name",
          "nickname",
          "preferred_username",
          "profile",
          "picture",
          "website",
          "gender",
          "birthdate",
          "zoneinfo",
          "locale",
          "updated_at",
          "username",
          "created_at",
          "email",
          "email_verified",
          "phone_number",
          "phone_number_verified",
          "address",
          "custom_data",
          "identities",
          "sso_identities",
          "roles",
          "organizations",
          "organization_data",
          "organization_roles",
          "sid",
          "auth_time",
          "iss",
        ],
        "code_challenge_methods_supported": [
          "S256",
        ],
        "device_authorization_endpoint": "<logto-url>/oidc/device/auth",
        "end_session_endpoint": "<logto-url>/oidc/session/end",
        "grant_types_supported": [
          "implicit",
          "authorization_code",
          "refresh_token",
          "client_credentials",
          "urn:ietf:params:oauth:grant-type:device_code",
          "urn:ietf:params:oauth:grant-type:token-exchange",
        ],
        "id_token_signing_alg_values_supported": [
          "ES384",
        ],
        "introspection_endpoint": "<logto-url>/oidc/token/introspection",
        "issuer": "<logto-url>/oidc",
        "jwks_uri": "<logto-url>/oidc/jwks",
        "pushed_authorization_request_endpoint": "<logto-url>/oidc/request",
        "request_uri_parameter_supported": false,
        "response_modes_supported": [
          "form_post",
          "fragment",
          "query",
        ],
        "response_types_supported": [
          "code id_token",
          "code",
          "id_token",
          "none",
        ],
        "revocation_endpoint": "<logto-url>/oidc/token/revocation",
        "scopes_supported": [
          "openid",
          "offline_access",
          "profile",
          "email",
          "phone",
          "address",
          "custom_data",
          "identities",
          "roles",
          "urn:logto:scope:organizations",
          "urn:logto:scope:organization_roles",
          "urn:logto:scope:sessions",
        ],
        "subject_types_supported": [
          "public",
        ],
        "token_endpoint": "<logto-url>/oidc/token",
        "token_endpoint_auth_methods_supported": [
          "client_secret_basic",
          "client_secret_jwt",
          "client_secret_post",
          "private_key_jwt",
          "none",
        ],
        "token_endpoint_auth_signing_alg_values_supported": [
          "HS256",
          "RS256",
          "PS256",
          "ES256",
          "Ed25519",
          "EdDSA",
        ],
        "userinfo_endpoint": "<logto-url>/oidc/me",
      }
    `);
  });
});
