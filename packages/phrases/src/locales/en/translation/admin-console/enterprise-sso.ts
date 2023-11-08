const enterprise_sso = {
  page_title: 'Enterprise SSO',
  title: 'Enterprise SSO',
  subtitle: 'Connect the enterprise identity provider and enable SP-initiated Single Sign-On.',
  create: 'Add enterprise connector',
  col_connector_name: 'Connector name',
  col_type: 'Type',
  col_email_domain: 'Email domain',
  col_status: 'Status',
  col_status_in_use: 'In use',
  col_status_invalid: 'Invalid',
  placeholder_title: 'Enterprise connector',
  placeholder_description:
    'Logto has provided many built-in enterprise identity providers to connect, meantime you can create your own with standard protocols.',
  create_modal: {
    title: 'Add enterprise connector',
    text_divider: 'Or you can customize your connector by a standard protocol.',
    connector_name_field_title: 'Connector name',
    connector_name_field_placeholder: 'Name for the enterprise identity provider',
    create_button_text: 'Create connector',
  },
};

export default Object.freeze(enterprise_sso);
