const enterprise_sso_details = {
  back_to_sso_connectors: 'Voltar para conectores de SSO empresarial',
  page_title: 'Detalhes do conector de SSO empresarial',
  readme_drawer_title: 'SSO empresarial',
  readme_drawer_subtitle:
    'Configurar conectores de SSO empresarial para permitir o SSO dos usuários finais',
  tab_settings: 'Configurações',
  tab_connection: 'Conexão',
  general_settings_title: 'Configurações gerais',
  custom_branding_title: 'Marca personalizada',
  custom_branding_description:
    'Personalize informações de exibição do IdP empresarial para o botão de login e outros cenários.',
  email_domain_field_name: 'Domínio de e-mail empresarial',
  email_domain_field_description:
    'Usuários com este domínio de e-mail podem usar o SSO para autenticação. Por favor, certifique-se de que o domínio pertence à empresa.',
  email_domain_field_placeholder: 'Domínio de e-mail',
  sync_profile_field_name: 'Sincronizar informações do perfil do provedor de identidade',
  sync_profile_option: {
    register_only: 'Apenas sincronizar no primeiro login',
    each_sign_in: 'Sempre sincronizar a cada login',
  },
  connector_name_field_name: 'Nome do conector',
  connector_logo_field_name: 'Logo do conector',
  branding_logo_context: 'Enviar logo',
  branding_logo_error: 'Erro ao enviar a logo: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://seu.domínio/logo.png',
  branding_dark_logo_context: 'Enviar logo para modo escuro',
  branding_dark_logo_error: 'Erro ao enviar a logo para modo escuro: {{error}}',
  branding_dark_logo_field_name: 'Logo (modo escuro)',
  branding_dark_logo_field_placeholder: 'https://seu.domínio/logo-modo-escuro.png',
  check_readme: 'Verificar leitura',
  enterprise_sso_deleted: 'O conector de SSO empresarial foi excluído com sucesso',
  delete_confirm_modal_title: 'Excluir conector de SSO empresarial',
  delete_confirm_modal_content:
    'Tem certeza de que deseja excluir este conector empresarial? Os usuários dos provedores de identidade não utilizarão o Logon Único.',
  upload_idp_metadata_title: 'Enviar metadados IdP',
  upload_idp_metadata_description: 'Configurar os metadados copiados do provedor de identidade.',
  upload_saml_idp_metadata_info_text_url:
    'Cole a URL dos metadados do provedor de identidade para conectar.',
  upload_saml_idp_metadata_info_text_xml:
    'Cole os metadados do provedor de identidade para conectar.',
  upload_saml_idp_metadata_info_text_manual:
    'Preencha os metadados do provedor de identidade para conectar.',
  upload_oidc_idp_info_text: 'Preencha as informações do provedor de identidade para conectar.',
  service_provider_property_title: 'Configurar seu serviço no IdP',
  service_provider_property_description:
    'Crie uma nova integração de aplicativo por {{protocol}} em seu {{name}}. Em seguida, cole os seguintes detalhes do provedor de serviços para configurar {{protocol}}.',
  attribute_mapping_title: 'Mapeamento de atributos',
  attribute_mapping_description:
    'O `id` e o `e-mail` do usuário são necessários para sincronizar o perfil do usuário do IdP. Insira o seguinte nome e valor em {{name}}.',
  saml_preview: {
    sign_on_url: 'URL de logon',
    entity_id: 'Emissor',
    x509_certificate: 'Certificado de assinatura',
  },
  oidc_preview: {
    authorization_endpoint: 'Ponto de autorização',
    token_endpoint: 'Ponto de token',
    userinfo_endpoint: 'Ponto de informações do usuário',
    jwks_uri: 'Ponto de conjunto de chaves da web JSON',
    issuer: 'Emissor',
  },
};

export default Object.freeze(enterprise_sso_details);
