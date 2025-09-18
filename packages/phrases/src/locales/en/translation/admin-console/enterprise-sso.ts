const enterprise_sso = {
  page_title: 'Enterprise SSO',
  title: 'Enterprise SSO',
  subtitle: 'Connect the enterprise identity provider and enable Single Sign-On.',
  create: 'Add enterprise connector',
  col_connector_name: 'Connector name',
  col_type: 'Type',
  col_email_domain: 'Email domain',

  placeholder_title: 'Enterprise connector',
  placeholder_description:
    'Logto has provided many built-in enterprise identity providers to connect, meantime you can create your own with SAML and OIDC protocols.',
  create_modal: {
    title: 'Add enterprise connector',
    text_divider: 'Or you can customize your connector by a standard protocol.',
    connector_name_field_title: 'Connector name',
    connector_name_field_placeholder: 'E.g., {corp. name} - {identity provider name}',
    create_button_text: 'Create connector',
  },
  guide: {
    subtitle: 'A step by step guide to connect the enterprise identity provider.',
    finish_button_text: 'Continue',
  },
  basic_info: {
    title: 'Configure your service in the IdP',
    description:
      'Create a new application integration by SAML 2.0 in your {{name}} identity provider. Then paste the following value to it.',
    saml: {
      acs_url_field_name: 'Assertion consumer service URL (Reply URL)',
      audience_uri_field_name: 'Audience URI (SP Entity ID)',
      entity_id_field_name: 'Service Provider (SP) Entity ID',
      entity_id_field_tooltip:
        'The SP Entity ID can be in any string format, typically using a URI form or a URL form as an identifier, but this is not mandatory.',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'Redirect URI (Callback URL)',
      redirect_uri_field_description:
        "Redirect URI is where users are redirected after SSO authentication. Add this URI to your IdP's configuration.",
      redirect_uri_field_custom_domain_description:
        'If you use multiple <a>custom domains</a> in Logto, be sure to add all corresponding callback URIs to your IdP to make SSO work across every domain.\n\nThe default Logto domain (*.logto.app) is always valid — include it only if you also wish to support SSO under that domain.',
    },
  },
  attribute_mapping: {
    title: 'Attribute mappings',
    description:
      '`id` and `email` are required to sync user profile from IdP. Enter the following claim name and value in your IdP.',
    col_sp_claims: 'Value of service provider (Logto)',
    col_idp_claims: 'Claim name of identity provider',
    idp_claim_tooltip: 'The claim name of the identity provider',
  },
  metadata: {
    title: 'Configure the IdP metadata',
    description: 'Configure the metadata from the identity provider',
    dropdown_trigger_text: 'Use another configuration method',
    dropdown_title: 'select your configuration method',
    metadata_format_url: 'Enter the metadata URL',
    metadata_format_xml: 'Upload the metadata XML file',
    metadata_format_manual: 'Enter metadata details manually',
    saml: {
      metadata_url_field_name: 'Metadata URL',
      metadata_url_description:
        'Dynamically fetch data from the metadata URL and keep certificate up to date.',
      metadata_xml_field_name: 'IdP metadata XML file',
      metadata_xml_uploader_text: 'Upload metadata XML file',
      sign_in_endpoint_field_name: 'Sign on URL',
      idp_entity_id_field_name: 'IdP entity ID (Issuer)',
      certificate_field_name: 'Signing certificate',
      certificate_placeholder: 'Copy and paste the x509 certificate',
      certificate_required: 'Signing certificate is required.',
    },
    oidc: {
      client_id_field_name: 'Client ID',
      client_secret_field_name: 'Client secret',
      issuer_field_name: 'Issuer',
      scope_field_name: 'Scope',
      scope_field_placeholder: 'Enter the scopes (separated by a space)',
    },
  },
};

export default Object.freeze(enterprise_sso);
