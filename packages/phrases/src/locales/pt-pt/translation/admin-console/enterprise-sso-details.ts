const enterprise_sso_details = {
  back_to_sso_connectors: 'Voltar aos conectores SSO empresariais',
  page_title: 'Detalhes do conector SSO empresarial',
  readme_drawer_title: 'SSO empresarial',
  readme_drawer_subtitle:
    'Configurar conectores SSO empresariais para permitir SSO para os utilizadores finais',
  tab_experience: 'Experiência SSO',
  tab_connection: 'Conexão',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: 'Geral',
  custom_branding_title: 'Exibição',
  custom_branding_description:
    'Personalize o nome e o logótipo exibidos no fluxo de Início de Sessão Única dos utilizadores finais. Quando vazio, são usados os predefinidos.',
  email_domain_field_name: 'Domínio de email empresarial',
  email_domain_field_description:
    'Utilizadores com este domínio de email podem usar SSO para autenticação. Por favor, verifique se o domínio pertence à empresa.',
  email_domain_field_placeholder: 'Domínio do email',
  sync_profile_field_name: 'Sincronizar informações do perfil do fornecedor de identidade',
  sync_profile_option: {
    register_only: 'Apenas sincronizar no primeiro início de sessão',
    each_sign_in: 'Sincronizar sempre em cada início de sessão',
  },
  connector_name_field_name: 'Nome do conector',
  display_name_field_name: 'Nome a exibir',
  connector_logo_field_name: 'Logótipo a exibir',
  connector_logo_field_description:
    'Cada imagem deve ter no máximo 500KB, apenas SVG, PNG, JPG, JPEG.',
  branding_logo_context: 'Enviar logótipo',
  branding_logo_error: 'Erro ao enviar logótipo: {{error}}',
  branding_light_logo_context: 'Enviar logótipo modo claro',
  branding_light_logo_error: 'Erro ao enviar logótipo modo claro: {{error}}',
  branding_logo_field_name: 'Logótipo',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: 'Enviar logótipo modo escuro',
  branding_dark_logo_error: 'Erro ao enviar logótipo modo escuro: {{error}}',
  branding_dark_logo_field_name: 'Logótipo (modo escuro)',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: 'Guia de conexão',
  enterprise_sso_deleted: 'O conector SSO empresarial foi eliminado com sucesso',
  delete_confirm_modal_title: 'Eliminar conector SSO empresarial',
  delete_confirm_modal_content:
    'Tem a certeza de que deseja eliminar este conector empresarial? Os utilizadores dos fornecedores de identidade não utilizarão Início de Sessão Única.',
  upload_idp_metadata_title_saml: 'Enviar os metadados',
  upload_idp_metadata_description_saml:
    'Configurar os metadados copiados do fornecedor de identidade.',
  upload_idp_metadata_title_oidc: 'Enviar as credenciais',
  upload_idp_metadata_description_oidc:
    'Configurar as credenciais e informações do token OIDC copiadas do fornecedor de identidade.',
  upload_idp_metadata_button_text: 'Enviar ficheiro XML de metadados',
  upload_signing_certificate_button_text: 'Enviar ficheiro de certificado de assinatura',
  configure_domain_field_info_text:
    'Adicione o domínio de email para orientar os utilizadores empresariais para o respetivo fornecedor de identidade para Início de Sessão Única.',
  email_domain_field_required: 'O domínio de email é obrigatório para ativar o SSO empresarial.',
  upload_saml_idp_metadata_info_text_url:
    'Cole o URL dos metadados do fornecedor de identidade para conectar.',
  upload_saml_idp_metadata_info_text_xml:
    'Cole os metadados do fornecedor de identidade para conectar.',
  upload_saml_idp_metadata_info_text_manual:
    'Preencha os metadados do fornecedor de identidade para conectar.',
  upload_oidc_idp_info_text: 'Preencha as informações do fornecedor de identidade para conectar.',
  service_provider_property_title: 'Configurar no IdP',
  service_provider_property_description:
    'Configure uma integração de aplicação usando {{protocol}} no seu fornecedor de identidade. Introduza os detalhes fornecidos pela Logto.',
  attribute_mapping_title: 'Mapeamento de atributos',
  attribute_mapping_description:
    'Sincronize perfis de utilizadores do fornecedor de identidade configurando o mapeamento de atributos do utilizador, quer no fornecedor de identidade, quer no lado da Logto.',
  saml_preview: {
    sign_on_url: 'URL de início de sessão',
    entity_id: 'Emissor',
    x509_certificate: 'Certificado de assinatura',
    certificate_content: 'A expirar {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'Ponto de autorização',
    token_endpoint: 'Ponto de token',
    userinfo_endpoint: 'Ponto de informação do utilizador',
    jwks_uri: 'Ponto de conjunto de chaves JSON',
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
