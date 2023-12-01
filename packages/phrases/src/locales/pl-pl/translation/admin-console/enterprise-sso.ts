const enterprise_sso = {
  page_title: 'Jednolite logowanie dla przedsiębiorstw',
  title: 'Jednolite logowanie dla przedsiębiorstw',
  subtitle:
    'Połącz dostawcę tożsamości przedsiębiorstwa i włącz jednostronne logowanie jednolitego.',
  create: 'Dodaj łącznik przedsiębiorstwa',
  col_connector_name: 'Nazwa łącznika',
  col_type: 'Typ',
  col_email_domain: 'Domena e-mail',
  placeholder_title: 'Łącznik przedsiębiorstwa',
  /** UNTRANSLATED */
  placeholder_description:
    'Logto has provided many built-in enterprise identity providers to connect, meantime you can create your own with SAML and OIDC protocols.',
  create_modal: {
    title: 'Dodaj łącznik przedsiębiorstwa',
    text_divider: 'Albo możesz dostosować swój łącznik za pomocą standardowego protokołu.',
    connector_name_field_title: 'Nazwa łącznika',
    /** UNTRANSLATED */
    connector_name_field_placeholder: 'E.g., {corp. name} - {identity provider name}',
    create_button_text: 'Stwórz łącznik',
  },
  guide: {
    /** UNTRANSLATED */
    subtitle: 'A step by step guide to connect the enterprise identity provider.',
    /** UNTRANSLATED */
    finish_button_text: 'Continue',
  },
  basic_info: {
    /** UNTRANSLATED */
    title: 'Configure your service in the IdP',
    /** UNTRANSLATED */
    description:
      'Create a new application integration by SAML 2.0 in your {{name}} identity provider. Then paste the following value to it.',
    saml: {
      /** UNTRANSLATED */
      acs_url_field_name: 'Assertion consumer service URL (Reply URL)',
      /** UNTRANSLATED */
      audience_uri_field_name: 'Audience URI (SP Entity ID)',
    },
    oidc: {
      /** UNTRANSLATED */
      redirect_uri_field_name: 'Redirect URI (Callback URL)',
    },
  },
  attribute_mapping: {
    /** UNTRANSLATED */
    title: 'Attribute mappings',
    /** UNTRANSLATED */
    description:
      '`id` and `email` are required to sync user profile from IdP. Enter the following claim name and value in your IdP.',
    /** UNTRANSLATED */
    col_sp_claims: 'Value of service provider (Logto)',
    /** UNTRANSLATED */
    col_idp_claims: 'Claim name of identity provider',
    /** UNTRANSLATED */
    idp_claim_tooltip: 'The claim name of the identity provider',
  },
  metadata: {
    /** UNTRANSLATED */
    title: 'Configure the IdP metadata',
    /** UNTRANSLATED */
    description: 'Configure the metadata from the identity provider',
    /** UNTRANSLATED */
    dropdown_trigger_text: 'Use another configuration method',
    /** UNTRANSLATED */
    dropdown_title: 'select your configuration method',
    /** UNTRANSLATED */
    metadata_format_url: 'Enter the metadata URL',
    /** UNTRANSLATED */
    metadata_format_xml: 'Upload the metadata XML file',
    /** UNTRANSLATED */
    metadata_format_manual: 'Enter metadata details manually',
    saml: {
      /** UNTRANSLATED */
      metadata_url_field_name: 'Metadata URL',
      /** UNTRANSLATED */
      metadata_url_description:
        'Dynamically fetch data from the metadata URL and keep certificate up to date.',
      /** UNTRANSLATED */
      metadata_xml_field_name: 'IdP metadata XML file',
      /** UNTRANSLATED */
      metadata_xml_uploader_text: 'Upload metadata XML file',
      /** UNTRANSLATED */
      sign_in_endpoint_field_name: 'Sign on URL',
      /** UNTRANSLATED */
      idp_entity_id_field_name: 'IdP entity ID (Issuer)',
      /** UNTRANSLATED */
      certificate_field_name: 'Signing certificate',
      /** UNTRANSLATED */
      certificate_placeholder: 'Copy and paste the x509 certificate',
    },
    oidc: {
      /** UNTRANSLATED */
      client_id_field_name: 'Client ID',
      /** UNTRANSLATED */
      client_secret_field_name: 'Client secret',
      /** UNTRANSLATED */
      issuer_field_name: 'Issuer',
      /** UNTRANSLATED */
      scope_field_name: 'Scope',
    },
  },
};

export default Object.freeze(enterprise_sso);
