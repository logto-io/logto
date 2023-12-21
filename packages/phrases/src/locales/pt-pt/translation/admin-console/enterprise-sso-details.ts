const enterprise_sso_details = {
  back_to_sso_connectors: 'Voltar aos conectores SSO empresariais',
  page_title: 'Detalhes do conector SSO empresarial',
  readme_drawer_title: 'SSO empresarial',
  readme_drawer_subtitle:
    'Configurar conectores SSO empresariais para permitir SSO para os utilizadores finais',
  tab_experience: 'Experiência SSO',
  tab_connection: 'Conexão',
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
};

export default Object.freeze(enterprise_sso_details);
