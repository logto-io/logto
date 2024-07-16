const enterprise_sso_details = {
  back_to_sso_connectors: 'Back to enterprise SSO',
  page_title: 'Enterprise SSO connector details',
  readme_drawer_title: 'Enterprise SSO',
  readme_drawer_subtitle: 'Set up enterprise SSO connectors to enable end users SSO',
  tab_experience: 'SSO Experience',
  tab_connection: 'Connection',
  general_settings_title: 'General',
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
};

export default Object.freeze(enterprise_sso_details);
