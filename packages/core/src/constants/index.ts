import {
  reservedBuiltInProfileKeys,
  reservedCustomDataKeys,
  reservedSignInIdentifierKeys,
} from '@logto/schemas';

export const protectedAppSignInCallbackUrl = 'sign-in-callback';
/** The default lifetime of subject tokens (in seconds) */
export const subjectTokenExpiresIn = 600;
/** The prefix for subject tokens */
export const subjectTokenPrefix = 'sub_';

/** The default lifetime of SSO SAML assertion record (in milliseconds) */
export const defaultIdPInitiatedSamlSsoSessionTtl = 10 * 60 * 1000; // 10 minutes

export const idpInitiatedSamlSsoSessionCookieName = '_logto_idp_saml_sso_session_id';
export const spInitiatedSamlSsoSessionCookieName = '_logto_sp_saml_sso_session_id';

export const reservedBuiltInProfileKeySet = new Set<string>(reservedBuiltInProfileKeys);
export const reservedCustomDataKeySet = new Set<string>(reservedCustomDataKeys);
export const reservedSignInIdentifierKeySet = new Set<string>(reservedSignInIdentifierKeys);
