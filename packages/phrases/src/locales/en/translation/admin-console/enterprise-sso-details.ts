const enterprise_sso_details = {
  back_to_sso_connectors: 'Back to enterprise SSO',
  page_title: 'Enterprise SSO connector details',
  readme_drawer_title: 'Enterprise SSO',
  readme_drawer_subtitle: 'Set up enterprise SSO connectors to enable end users SSO',
  tab_experience: 'Experience',
  tab_connection: 'Connection',
  general_settings_title: 'General Settings',
  custom_branding_title: 'Custom Branding',
  custom_branding_description:
    'Customize enterprise IdP display information for sign-in button and other scenarios.',
  email_domain_field_name: 'Enterprise email domain',
  email_domain_field_description:
    'Users with this email domain can use SSO for authentication. Please ensure the domain belongs to the enterprise.',
  email_domain_field_placeholder: 'Email domain',
  sync_profile_field_name: 'Sync profile information from the identity provider',
  sync_profile_option: {
    register_only: 'Only sync at first sign-in',
    each_sign_in: 'Always sync at each sign-in',
  },
  connector_name_field_name: 'Connector name',
  display_name_field_name: 'Display name',
  connector_logo_field_name: 'Connector logo',
  branding_logo_context: 'Upload logo',
  branding_logo_error: 'Upload logo error: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: 'Upload dark mode logo',
  branding_dark_logo_error: 'Upload dark mode logo error: {{error}}',
  branding_dark_logo_field_name: 'Logo (dark mode)',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_readme: 'Check README',
  enterprise_sso_deleted: 'Enterprise SSO connector has been successfully deleted',
  delete_confirm_modal_title: 'Delete enterprise SSO connector',
  delete_confirm_modal_content:
    'Are you sure you want to delete this enterprise connector? Users from identity providers will not utilize Single Sign-On.',
  upload_idp_metadata_title: 'Upload IdP metadata',
  upload_idp_metadata_description: 'Configure the metadata copied from the identity provider.',
  upload_idp_metadata_button_text: 'Upload metadata XML file',
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
  service_provider_property_title: 'Configure your service in the IdP',
  service_provider_property_description:
    'Create a new app integration by {{protocol}} in your {{name}}. Then paste the following Service Provider details to configure {{protocol}}.',
  attribute_mapping_title: 'Attribute mapping',
  attribute_mapping_description:
    "User's `id` and `email` are required to sync user profile from IdP. Enter the following name and value in {{name}}.",
  saml_preview: {
    sign_on_url: 'Sign on URL',
    entity_id: 'Issuer',
    x509_certificate: 'Signing certificate',
  },
  oidc_preview: {
    authorization_endpoint: 'Authorization endpoint',
    token_endpoint: 'Token endpoint',
    userinfo_endpoint: 'User information endpoint',
    jwks_uri: 'JSON web key set endpoint',
    issuer: 'Issuer',
  },
};

export default Object.freeze(enterprise_sso_details);
