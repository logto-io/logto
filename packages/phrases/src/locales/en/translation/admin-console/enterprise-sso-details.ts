const enterprise_sso_details = {
  back_to_sso_connectors: 'Back to enterprise SSO',
  page_title: 'Enterprise SSO connector details',
  readme_drawer_title: 'Enterprise SSO',
  readme_drawer_subtitle: 'Set up enterprise SSO connectors to enable end users SSO',
  tab_settings: 'Settings',
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
};

export default Object.freeze(enterprise_sso_details);
