const user_identity_details = {
  /** UNTRANSLATED */
  social_identity_page_title: 'Social identity details',
  /** UNTRANSLATED */
  back_to_user_details: 'Back to user details',
  /** UNTRANSLATED */
  delete_identity: `Remove identity connection`,
  social_account: {
    /** UNTRANSLATED */
    title: 'Social account',
    /** UNTRANSLATED */
    description:
      'View user data and profile information synced from the linked {{connectorName}} account.',
    /** UNTRANSLATED */
    provider_name: 'Social identity provider name',
    /** UNTRANSLATED */
    identity_id: 'Social identity ID',
    /** UNTRANSLATED */
    user_profile: 'User profile synced from social identity provider',
  },
  sso_account: {
    /** UNTRANSLATED */
    title: 'Enterprise SSO account',
    /** UNTRANSLATED */
    description:
      'View user data and profile information synced from the linked {{connectorName}} account.',
    /** UNTRANSLATED */
    provider_name: 'Enterprise SSO identity provider name',
    /** UNTRANSLATED */
    identity_id: 'Enterprise SSO identity ID',
    /** UNTRANSLATED */
    user_profile: 'User profile synced from enterprise SSO identity provider',
  },
  token_storage: {
    /** UNTRANSLATED */
    title: 'Access token',
    /** UNTRANSLATED */
    description:
      'Store access and refresh tokens from {{connectorName}} in the Secret Vault. Allows automated API calls without repeated user consent.',
  },
  access_token: {
    /** UNTRANSLATED */
    title: 'Access token',
    /** UNTRANSLATED */
    description_active:
      'Access token is active and securely stored in the Secret Vault. Your product can use it to access the {{connectorName}} APIs.',
    /** UNTRANSLATED */
    description_inactive:
      'This access token is inactive (e.g., revoked). Users must re-authorize access to restore functionality.',
    /** UNTRANSLATED */
    description_expired:
      'This access token has expired. Renewal occurs automatically on the next API request using the refresh token. If the refresh token is not available, user re-authentication is required.',
  },
  refresh_token: {
    /** UNTRANSLATED */
    available:
      'Refresh token is available. If the access token expires, it will be automatically refreshed using the refresh token.',
    /** UNTRANSLATED */
    not_available:
      'Refresh token is not available. After the access token expires, users must re-authenticate to obtain new tokens.',
  },
  /** UNTRANSLATED */
  token_status: 'Token status',
  /** UNTRANSLATED */
  created_at: 'Created at',
  /** UNTRANSLATED */
  updated_at: 'Updated at',
  /** UNTRANSLATED */
  expires_at: 'Expires at',
  /** UNTRANSLATED */
  scopes: 'Scopes',
  delete_tokens: {
    /** UNTRANSLATED */
    title: 'Delete tokens',
    /** UNTRANSLATED */
    description:
      'Delete the stored tokens. Users must re-authorize access to restore functionality.',
    /** UNTRANSLATED */
    confirmation_message:
      'Are you sure you want to delete tokens?  Logto Secret Vault will remove the stored {{connectorName}} access and refresh tokens. This user must re-authorize to restore {{connectorName}} API access.',
  },
  token_storage_disabled: {
    /** UNTRANSLATED */
    title: 'Token storage is disabled for this connector',
    /** UNTRANSLATED */
    description:
      'Users can currently use {{connectorName}} only to sign-in, link accounts, or sync profiles during each consent flow. To access {{connectorName}} APIs and perform actions on behalf of users, please enable token storage in',
  },
};

export default Object.freeze(user_identity_details);
