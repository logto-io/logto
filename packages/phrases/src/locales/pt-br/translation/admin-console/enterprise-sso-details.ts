const enterprise_sso_details = {
  back_to_sso_connectors: 'Voltar para os conectores de SSO empresarial',
  page_title: 'Detalhes do conector de SSO empresarial',
  readme_drawer_title: 'SSO empresarial',
  readme_drawer_subtitle:
    'Configurar conectores de SSO empresarial para habilitar o SSO dos usuários finais',
  tab_experience: 'Experiência de SSO',
  tab_connection: 'Conexão',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: 'Geral',
  custom_branding_title: 'Exibição',
  custom_branding_description:
    'Personalize o nome e o logotipo exibidos no fluxo de Logon Único dos usuários finais. Quando vazio, os padrões são usados.',
  email_domain_field_name: 'Domínio de e-mail da empresa',
  email_domain_field_description:
    'Usuários com este domínio de e-mail podem usar SSO para autenticação. Verifique se o domínio pertence à empresa.',
  email_domain_field_placeholder: 'Domínio do e-mail',
  sync_profile_field_name: 'Sincronizar informações de perfil do provedor de identidade',
  sync_profile_option: {
    register_only: 'Apenas sincronizar no primeiro logon',
    each_sign_in: 'Sempre sincronizar a cada logon',
  },
  connector_name_field_name: 'Nome do conector',
  display_name_field_name: 'Nome de exibição',
  connector_logo_field_name: 'Logotipo de exibição',
  connector_logo_field_description:
    'Cada imagem deve ter no máximo 500KB, apenas SVG, PNG, JPG, JPEG.',
  branding_logo_context: 'Fazer upload do logotipo',
  branding_logo_error: 'Erro ao fazer upload do logotipo: {{error}}',
  branding_light_logo_context: 'Fazer upload do logotipo do modo claro',
  branding_light_logo_error: 'Erro ao fazer upload do logotipo do modo claro: {{error}}',
  branding_logo_field_name: 'Logotipo',
  branding_logo_field_placeholder: 'https://seu.domínio/logo.png',
  branding_dark_logo_context: 'Fazer upload do logotipo do modo escuro',
  branding_dark_logo_error: 'Erro ao fazer upload do logotipo do modo escuro: {{error}}',
  branding_dark_logo_field_name: 'Logotipo (modo escuro)',
  branding_dark_logo_field_placeholder: 'https://seu.domínio/logomodo-escuro.png',
  check_connection_guide: 'Guia de conexão',
  enterprise_sso_deleted: 'O conector de SSO empresarial foi excluído com sucesso',
  delete_confirm_modal_title: 'Excluir conector de SSO empresarial',
  delete_confirm_modal_content:
    'Tem certeza de que deseja excluir este conector empresarial? Os usuários dos provedores de identidade não utilizarão o Logon Único.',
  upload_idp_metadata_title_saml: 'Fazer upload dos metadados',
  upload_idp_metadata_description_saml:
    'Configurar os metadados copiados do provedor de identidade.',
  upload_idp_metadata_title_oidc: 'Fazer upload das credenciais',
  upload_idp_metadata_description_oidc:
    'Configurar as credenciais e as informações de token OIDC copiadas do provedor de identidade.',
  upload_idp_metadata_button_text: 'Fazer upload do arquivo XML de metadados',
  upload_signing_certificate_button_text: 'Fazer upload do arquivo de certificado de assinatura',
  configure_domain_field_info_text:
    'Adicionar domínio de e-mail para orientar os usuários empresariais para seu provedor de identidade para Logon Único.',
  email_domain_field_required:
    'O domínio de e-mail é obrigatório para habilitar o SSO empresarial.',
  upload_saml_idp_metadata_info_text_url:
    'Cole a URL dos metadados do provedor de identidade para conectar.',
  upload_saml_idp_metadata_info_text_xml:
    'Cole os metadados do provedor de identidade para conectar.',
  upload_saml_idp_metadata_info_text_manual:
    'Preencha os metadados do provedor de identidade para conectar.',
  upload_oidc_idp_info_text: 'Preencha as informações do provedor de identidade para conectar.',
  service_provider_property_title: 'Configurar no IdP',
  service_provider_property_description:
    'Configure uma integração de aplicativos usando {{protocol}} em seu provedor de identidade. Insira os detalhes fornecidos pela Logto.',
  attribute_mapping_title: 'Mapeamento de atributos',
  attribute_mapping_description:
    'Sincronize perfis de usuário do provedor de identidade configurando o mapeamento de atributos do usuário no lado do provedor de identidade para Logto.',
  saml_preview: {
    sign_on_url: 'URL de logon',
    entity_id: 'Emissor',
    x509_certificate: 'Certificado de assinatura',
    certificate_content: 'Expira em {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'Endpoint de autorização',
    token_endpoint: 'Endpoint de token',
    userinfo_endpoint: 'Endpoint de informações do usuário',
    jwks_uri: 'Endpoint do conjunto de chaves JSON web',
    issuer: 'Emissor',
  },
  idp_initiated_auth_config: {
    /** UNTRANSLATED */
    card_title: 'IdP-initiated SSO',
    /** UNTRANSLATED */
    card_description:
      'User typically start the authentication process from your app using the SP-initiated SSO flow. DO NOT enable this feature unless absolutely necessary.',
    /** UNTRANSLATED */
    enable_idp_initiated_sso: 'Enable IdP-initiated SSO',
    /** UNTRANSLATED */
    enable_idp_initiated_sso_description:
      "Allow enterprise users to start the authentication process directly from the identity provider's portal. Please understand the potential security risks before enabling this feature.",
    /** UNTRANSLATED */
    default_application: 'Default application',
    /** UNTRANSLATED */
    default_application_tooltip:
      'Target application the user will be redirected to after authentication.',
    /** UNTRANSLATED */
    empty_applications_error:
      'No applications found. Please add one in the <a>Applications</a> section.',
    /** UNTRANSLATED */
    empty_applications_placeholder: 'No applications',
    /** UNTRANSLATED */
    authentication_type: 'Authentication type',
    /** UNTRANSLATED */
    auto_authentication_disabled_title: 'Redirect to client for SP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_disabled_description:
      'Recommended. Redirect users to the client-side application to initiate a secure SP-initiated OIDC authentication.  This will prevent the CSRF attacks.',
    /** UNTRANSLATED */
    auto_authentication_enabled_title: 'Directly sign in using the IdP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_enabled_description:
      'After successful sign-in, users will be redirected to the specified Redirect URI with the authorization code (Without state and PKCE validation).',
    /** UNTRANSLATED */
    auto_authentication_disabled_app: 'For traditional web app, single-page app (SPA)',
    /** UNTRANSLATED */
    auto_authentication_enabled_app: 'For traditional web app',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri: 'Client callback URI',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri_tooltip:
      'The client callback URI to initiate a SP-initiated SSO authentication flow. An ssoConnectorId will be appended to the URI as a query parameter. (e.g., https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    /** UNTRANSLATED */
    redirect_uri: 'Post sign-in redirect URI',
    /** UNTRANSLATED */
    redirect_uri_tooltip:
      'The redirect URI to redirect users after successful sign-in. Logto will use this URI as the OIDC redirect URI in the authorization request. Use a dedicated URI for the IdP-initiated SSO authentication flow for better security.',
    /** UNTRANSLATED */
    empty_redirect_uris_error:
      'No redirect URI has been registered for the application. Please add one first.',
    /** UNTRANSLATED */
    redirect_uri_placeholder: 'Select a post sign-in redirect URI',
    /** UNTRANSLATED */
    auth_params: 'Additional authentication parameters',
    /** UNTRANSLATED */
    auth_params_tooltip:
      'Additional parameters to be passed in the authorization request. By default only (openid profile) scopes will be requested, you can specify additional scopes or a exclusive state value here. (e.g., { "scope": "organizations email", "state": "secret_state" }).',
  },
  /** UNTRANSLATED */
  trust_unverified_email: 'Trust unverified email',
  /** UNTRANSLATED */
  trust_unverified_email_label:
    'Always trust the unverified email addresses returned from the identity provider',
  /** UNTRANSLATED */
  trust_unverified_email_tip:
    'The Entra ID (OIDC) connector does not return the `email_verified` claim, meaning that email addresses from Azure are not guaranteed to be verified. By default, Logto will not sync unverified email addresses to the user profile. Enable this option only if you trust all the email addresses from the Entra ID directory.',
};

export default Object.freeze(enterprise_sso_details);
