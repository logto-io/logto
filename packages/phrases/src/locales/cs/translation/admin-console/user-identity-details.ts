const user_identity_details = {
  social_identity_page_title: 'Social identity details',
  back_to_user_details: 'Back to user details',
  delete_identity: `Remove identity connection`,
  social_account: {
    title: 'Social account',
    description:
      'View user data and profile information synced from the linked {{connectorName}} account.',
    provider_name: 'Social identity provider name',
    identity_id: 'Social identity ID',
    user_profile: 'User profile synced from social identity provider',
  },
  sso_account: {
    title: 'Enterprise SSO account',
    description:
      'View user data and profile information synced from the linked {{connectorName}} account.',
    provider_name: 'Enterprise SSO identity provider name',
    identity_id: 'Enterprise SSO identity ID',
    user_profile: 'User profile synced from enterprise SSO identity provider',
  },
  token_storage: {
    title: 'Access token',
    description:
      'Store access and refresh tokens from {{connectorName}} in the Secret Vault. Allows automated API calls without repeated user consent.',
  },
  access_token: {
    title: 'Access token',
    description_active:
      'Access token is active and securely stored in the Secret Vault. Your product can use it to access the {{connectorName}} APIs.',
    description_inactive:
      'This access token is inactive (e.g., revoked). Users must re-authorize access to restore functionality.',
    description_expired:
      'This access token has expired. Renewal occurs automatically on the next API request using the refresh token. If the refresh token is not available, user re-authentication is required.',
  },
  refresh_token: {
    available:
      'Refresh token is available. If the access token expires, it will be automatically refreshed using the refresh token.',
    not_available:
      'Refresh token is not available. After the access token expires, users must re-authenticate to obtain new tokens.',
  },
  token_status: 'Token status',
  created_at: 'Created at',
  updated_at: 'Updated at',
  expires_at: 'Expires at',
  scopes: 'Scopes',
  delete_tokens: {
    title: 'Delete tokens',
    description:
      'Delete the stored tokens. Users must re-authorize access to restore functionality.',
    confirmation_message:
      'Are you sure you want to delete tokens?  Logto Secret Vault will remove the stored {{connectorName}} access and refresh tokens. This user must re-authorize to restore {{connectorName}} API access.',
  },
  token_storage_disabled: {
    title: 'Token storage is disabled for this connector',
    description:
      'Users can currently use {{connectorName}} only to sign-in, link accounts, or sync profiles during each consent flow. To access {{connectorName}} APIs and perform actions on behalf of users, please enable token storage in',
  },
};

export default user_identity_details;
