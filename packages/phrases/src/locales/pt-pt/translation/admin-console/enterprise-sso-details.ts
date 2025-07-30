const enterprise_sso_details = {
  back_to_sso_connectors: 'Voltar aos conectores SSO empresariais',
  page_title: 'Detalhes do conector SSO empresarial',
  readme_drawer_title: 'SSO empresarial',
  readme_drawer_subtitle:
    'Configurar conectores SSO empresariais para permitir SSO para os utilizadores finais',
  tab_experience: 'Experiência SSO',
  tab_connection: 'Conexão',
  tab_idp_initiated_auth: 'SSO iniciado pelo IdP',
  general_settings_title: 'Geral',
  general_settings_description:
    'Configure a experiência do utilizador final e vincule o domínio de email empresarial para o fluxo de SSO iniciado pelo SP.',
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
    card_title: 'SSO iniciado pelo IdP',
    card_description:
      'Os utilizadores normalmente iniciam o processo de autenticação a partir da tua aplicação usando o fluxo de SSO iniciado pelo SP. NÃO atives esta funcionalidade a menos que seja absolutamente necessário.',
    enable_idp_initiated_sso: 'Ativar SSO iniciado pelo IdP',
    enable_idp_initiated_sso_description:
      'Permitir que utilizadores empresariais iniciem o processo de autenticação diretamente a partir do portal do fornecedor de identidade. Entenda os riscos potenciais de segurança antes de ativar esta funcionalidade.',
    default_application: 'Aplicação padrão',
    default_application_tooltip:
      'Aplicação alvo para a qual o utilizador será redirecionado após a autenticação.',
    empty_applications_error:
      'Nenhuma aplicação encontrada. Por favor, adicione uma na secção de <a>Aplicações</a>.',
    empty_applications_placeholder: 'Nenhuma aplicação',
    authentication_type: 'Tipo de autenticação',
    auto_authentication_disabled_title: 'Redirecionar para o cliente para SSO iniciado pelo SP',
    auto_authentication_disabled_description:
      'Recomendado. Redirecione os utilizadores para a aplicação no lado do cliente para iniciar uma autenticação OIDC segura iniciada pelo SP. Isso irá prevenir ataques CSRF.',
    auto_authentication_enabled_title: 'Iniciar sessão diretamente usando o SSO iniciado pelo IdP',
    auto_authentication_enabled_description:
      'Após início de sessão bem-sucedido, os utilizadores serão redirecionados para a URI de redirecionamento especificada com o código de autorização (Sem validação de state e PKCE).',
    auto_authentication_disabled_app:
      'Para aplicação web tradicional, aplicação de página única (SPA)',
    auto_authentication_enabled_app: 'Para aplicação web tradicional',
    idp_initiated_auth_callback_uri: 'URI de retorno do cliente',
    idp_initiated_auth_callback_uri_tooltip:
      'A URI de retorno do cliente para iniciar um fluxo de autenticação SSO iniciado pelo SP. Um ssoConnectorId será adicionado à URI como um parâmetro de consulta. (ex.: https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    redirect_uri: 'URI de redirecionamento após início de sessão',
    redirect_uri_tooltip:
      'A URI de redirecionamento para redirecionar os utilizadores após um início de sessão bem-sucedido. A Logto usará esta URI como a URI de redirecionamento OIDC na solicitação de autorização. Use uma URI dedicada para o fluxo de autenticação SSO iniciado pelo IdP para melhor segurança.',
    empty_redirect_uris_error:
      'Nenhuma URI de redirecionamento foi registada para a aplicação. Por favor, adicione uma primeiro.',
    redirect_uri_placeholder: 'Selecionar uma URI de redirecionamento após início de sessão',
    auth_params: 'Parâmetros adicionais de autenticação',
    auth_params_tooltip:
      'Parâmetros adicionais a serem passados na solicitação de autorização. Por padrão, apenas os scopes (openid profile) serão solicitados. Podes especificar scopes adicionais ou um valor de state exclusivo aqui. (ex.: { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: 'Confiar em email não verificado',
  trust_unverified_email_label:
    'Confiar sempre nos endereços de email não verificados retornados pelo fornecedor de identidade',
  trust_unverified_email_tip:
    'O conector Entra ID (OIDC) não retorna a reivindicação `email_verified`, o que significa que os endereços de email do Azure não são garantidamente verificados. Por padrão, o Logto não sincronizará endereços de email não verificados para o perfil do utilizador. Ative esta opção apenas se confiar em todos os endereços de email do diretório do Entra ID.',
  offline_access: {
    label: 'Atualizar token de acesso',
    description:
      'Ative o acesso `offline` do Google para solicitar um token de atualização, permitindo que a tua aplicação atualize o token de acesso sem a reautorização do utilizador.',
  },
};

export default Object.freeze(enterprise_sso_details);
