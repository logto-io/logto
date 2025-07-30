const enterprise_sso_details = {
  back_to_sso_connectors: 'Back to enterprise SSO',
  page_title: 'Enterprise SSO connector details',
  readme_drawer_title: 'Enterprise SSO',
  readme_drawer_subtitle: 'Set up enterprise SSO connectors to enable end users SSO',
  tab_experience: 'SSO Experience',
  tab_connection: 'Connection',
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: 'General',
  general_settings_description:
    'Configure end-user experience and link enterprise email domain for SP-initiated SSO flow.',
  custom_branding_title: 'Display',
  custom_branding_description:
    "Customize the name and logo displayed in the end users' Single Sign-On flow. When empty, defaults are used.",
  email_domain_field_name: 'Enterprise email domains',
  email_domain_field_description:
    'Users with these email domains can use SSO for authentication. Please verify the domain ownership before adding.',
  email_domain_field_placeholder: 'Enter one or more email domains (e.g. yourcompany.com)',
  sync_profile_field_name: 'Sync profile information from the identity provider',
  sync_profile_option: {
    register_only: 'Only sync at first sign-in',
    each_sign_in: 'Always sync at each sign-in',
  },
  connector_name_field_name: 'Connector name',
  display_name_field_name: 'Display name',
  connector_logo_field_name: 'Display logo',
  connector_logo_field_description: 'Each image should under 500KB, SVG, PNG, JPG, JPEG only.',
  branding_logo_context: 'Upload logo',
  branding_logo_error: 'Upload logo error: {{error}}',
  branding_light_logo_context: 'Upload light mode logo',
  branding_light_logo_error: 'Upload light mode logo error: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: 'Upload dark mode logo',
  branding_dark_logo_error: 'Upload dark mode logo error: {{error}}',
  branding_dark_logo_field_name: 'Logo (dark mode)',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: 'Connection guide',
  enterprise_sso_deleted: 'Enterprise SSO connector has been successfully deleted',
  delete_confirm_modal_title: 'Delete enterprise SSO connector',
  delete_confirm_modal_content:
    'Are you sure you want to delete this enterprise connector? Users from identity providers will not utilize Single Sign-On.',
  upload_idp_metadata_title_saml: 'Upload the metadata',
  upload_idp_metadata_description_saml: 'Configure the metadata copied from the identity provider.',
  upload_idp_metadata_title_oidc: 'Upload the credentials',
  upload_idp_metadata_description_oidc:
    'Configure the credentials and OIDC token information copied from the identity provider.',
  upload_idp_metadata_button_text: 'Upload metadata XML file',
  upload_signing_certificate_button_text: 'Upload signing certificate file',
  configure_domain_field_info_text:
    'Add email domain to guide enterprise users to their identity provider for Single Sign-on.',
  email_domain_field_required: 'Email domain is required to enable enterprise SSO.',
  upload_saml_idp_metadata_info_text_url:
    'Paste the metadata URL from the identity provider to connect.',
  upload_saml_idp_metadata_info_text_xml:
    'Paste the metadata from the identity provider to connect.',
  upload_saml_idp_metadata_info_text_manual:
    'Fill in the metadata from the identity provider to connect.',
  upload_oidc_idp_info_text: 'Fill in the information from the identity provider to connect.',
  service_provider_property_title: 'Configure in the IdP',
  service_provider_property_description:
    'Set up an application integration using {{protocol}} in your identity provider. Enter the details provided by Logto.',
  attribute_mapping_title: 'Attribute mappings',
  attribute_mapping_description:
    'Sync user profiles from the identity provider by configuring user attribute mapping either on the identity provider to Logto side.',
  saml_preview: {
    sign_on_url: 'Sign on URL',
    entity_id: 'Issuer',
    x509_certificate: 'Signing certificate',
    certificate_content: 'Expiring {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'Authorization endpoint',
    token_endpoint: 'Token endpoint',
    userinfo_endpoint: 'User information endpoint',
    jwks_uri: 'JSON web key set endpoint',
    issuer: 'Issuer',
  },
  idp_initiated_auth_config: {
    card_title: 'IdP-initiated SSO',
    card_description:
      'User typically start the authentication process from your app using the SP-initiated SSO flow. DO NOT enable this feature unless absolutely necessary.',
    enable_idp_initiated_sso: 'Enable IdP-initiated SSO',
    enable_idp_initiated_sso_description:
      "Allow enterprise users to start the authentication process directly from the identity provider's portal. Please understand the potential security risks before enabling this feature.",
    default_application: 'Default application',
    default_application_tooltip:
      'Target application the user will be redirected to after authentication.',
    empty_applications_error:
      'No applications found. Please add one in the <a>Applications</a> section.',
    empty_applications_placeholder: 'No applications',
    authentication_type: 'Authentication type',
    auto_authentication_disabled_title: 'Redirect to client for SP-initiated SSO',
    auto_authentication_disabled_description:
      'Recommended. Redirect users to the client-side application to initiate a secure SP-initiated OIDC authentication.  This will prevent the CSRF attacks.',
    auto_authentication_enabled_title: 'Directly sign in using the IdP-initiated SSO',
    auto_authentication_enabled_description:
      'After successful sign-in, users will be redirected to the specified Redirect URI with the authorization code (Without state and PKCE validation).',
    auto_authentication_disabled_app: 'For traditional web app, single-page app (SPA)',
    auto_authentication_enabled_app: 'For traditional web app',
    idp_initiated_auth_callback_uri: 'Client callback URI',
    idp_initiated_auth_callback_uri_tooltip:
      'The client callback URI to initiate a SP-initiated SSO authentication flow. An ssoConnectorId will be appended to the URI as a query parameter. (e.g., https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    redirect_uri: 'Post sign-in redirect URI',
    redirect_uri_tooltip:
      'The redirect URI to redirect users after successful sign-in. Logto will use this URI as the OIDC redirect URI in the authorization request. Use a dedicated URI for the IdP-initiated SSO authentication flow for better security.',
    empty_redirect_uris_error:
      'No redirect URI has been registered for the application. Please add one first.',
    redirect_uri_placeholder: 'Select a post sign-in redirect URI',
    auth_params: 'Additional authentication parameters',
    auth_params_tooltip:
      'Additional parameters to be passed in the authorization request. By default only (openid profile) scopes will be requested, you can specify additional scopes or a exclusive state value here. (e.g., { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: 'Trust unverified email',
  trust_unverified_email_label:
    'Always trust the unverified email addresses returned from the identity provider',
  trust_unverified_email_tip:
    'The Entra ID (OIDC) connector does not return the `email_verified` claim, meaning that email addresses from Azure are not guaranteed to be verified. By default, Logto will not sync unverified email addresses to the user profile. Enable this option only if you trust all the email addresses from the Entra ID directory.',
  offline_access: {
    label: 'Refresh access token',
    description:
      'Enable Google `offline` access to request a refresh token, allowing your app to refresh the access token without user re-authorization.',
  },
};

export default Object.freeze(enterprise_sso_details);
