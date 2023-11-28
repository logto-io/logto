const enterprise_sso_details = {
  /** UNTRANSLATED */
  back_to_sso_connectors: 'Back to enterprise SSO',
  /** UNTRANSLATED */
  page_title: 'Enterprise SSO connector details',
  /** UNTRANSLATED */
  readme_drawer_title: 'Enterprise SSO',
  /** UNTRANSLATED */
  readme_drawer_subtitle: 'Set up enterprise SSO connectors to enable end users SSO',
  /** UNTRANSLATED */
  tab_experience: 'Experience',
  /** UNTRANSLATED */
  tab_connection: 'Connection',
  /** UNTRANSLATED */
  general_settings_title: 'General Settings',
  /** UNTRANSLATED */
  custom_branding_title: 'Custom Branding',
  /** UNTRANSLATED */
  custom_branding_description:
    'Customize enterprise IdP display information for sign-in button and other scenarios.',
  /** UNTRANSLATED */
  email_domain_field_name: 'Enterprise email domain',
  /** UNTRANSLATED */
  email_domain_field_description:
    'Users with this email domain can use SSO for authentication. Please ensure the domain belongs to the enterprise.',
  /** UNTRANSLATED */
  email_domain_field_placeholder: 'Email domain',
  /** UNTRANSLATED */
  sync_profile_field_name: 'Sync profile information from the identity provider',
  sync_profile_option: {
    /** UNTRANSLATED */
    register_only: 'Only sync at first sign-in',
    /** UNTRANSLATED */
    each_sign_in: 'Always sync at each sign-in',
  },
  /** UNTRANSLATED */
  connector_name_field_name: 'Connector name',
  /** UNTRANSLATED */
  display_name_field_name: 'Display name',
  /** UNTRANSLATED */
  connector_logo_field_name: 'Connector logo',
  /** UNTRANSLATED */
  branding_logo_context: 'Upload logo',
  /** UNTRANSLATED */
  branding_logo_error: 'Upload logo error: {{error}}',
  /** UNTRANSLATED */
  branding_logo_field_name: 'Logo',
  /** UNTRANSLATED */
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  /** UNTRANSLATED */
  branding_dark_logo_context: 'Upload dark mode logo',
  /** UNTRANSLATED */
  branding_dark_logo_error: 'Upload dark mode logo error: {{error}}',
  /** UNTRANSLATED */
  branding_dark_logo_field_name: 'Logo (dark mode)',
  /** UNTRANSLATED */
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  /** UNTRANSLATED */
  check_readme: 'Check README',
  /** UNTRANSLATED */
  enterprise_sso_deleted: 'Enterprise SSO connector has been successfully deleted',
  /** UNTRANSLATED */
  delete_confirm_modal_title: 'Delete enterprise SSO connector',
  /** UNTRANSLATED */
  delete_confirm_modal_content:
    'Are you sure you want to delete this enterprise connector? Users from identity providers will not utilize Single Sign-On.',
  /** UNTRANSLATED */
  upload_idp_metadata_title: 'Upload IdP metadata',
  /** UNTRANSLATED */
  upload_idp_metadata_description: 'Configure the metadata copied from the identity provider.',
  /** UNTRANSLATED */
  upload_idp_metadata_button_text: 'Upload metadata XML file',
  /** UNTRANSLATED */
  upload_saml_idp_metadata_info_text_url:
    'Paste the metadata URL from the identity provider to connect.',
  /** UNTRANSLATED */
  upload_saml_idp_metadata_info_text_xml:
    'Paste the metadata from the identity provider to connect.',
  /** UNTRANSLATED */
  upload_saml_idp_metadata_info_text_manual:
    'Fill in the metadata from the identity provider to connect.',
  /** UNTRANSLATED */
  upload_oidc_idp_info_text: 'Fill in the information from the identity provider to connect.',
  /** UNTRANSLATED */
  service_provider_property_title: 'Configure your service in the IdP',
  /** UNTRANSLATED */
  service_provider_property_description:
    'Create a new app integration by {{protocol}} in your {{name}}. Then paste the following Service Provider details to configure {{protocol}}.',
  /** UNTRANSLATED */
  attribute_mapping_title: 'Attribute mapping',
  /** UNTRANSLATED */
  attribute_mapping_description:
    "User's `id` and `email` are required to sync user profile from IdP. Enter the following name and value in {{name}}.",
  saml_preview: {
    /** UNTRANSLATED */
    sign_on_url: 'Sign on URL',
    /** UNTRANSLATED */
    entity_id: 'Issuer',
    /** UNTRANSLATED */
    x509_certificate: 'Signing certificate',
  },
  oidc_preview: {
    /** UNTRANSLATED */
    authorization_endpoint: 'Authorization endpoint',
    /** UNTRANSLATED */
    token_endpoint: 'Token endpoint',
    /** UNTRANSLATED */
    userinfo_endpoint: 'User information endpoint',
    /** UNTRANSLATED */
    jwks_uri: 'JSON web key set endpoint',
    /** UNTRANSLATED */
    issuer: 'Issuer',
  },
};

export default Object.freeze(enterprise_sso_details);
