const enterprise_sso_details = {
  back_to_sso_connectors: 'Voltar para os conectores de SSO empresarial',
  page_title: 'Detalhes do conector de SSO empresarial',
  readme_drawer_title: 'SSO empresarial',
  readme_drawer_subtitle:
    'Configurar conectores de SSO empresarial para habilitar o SSO dos usuários finais',
  tab_experience: 'Experiência de SSO',
  tab_connection: 'Conexão',
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
};

export default Object.freeze(enterprise_sso_details);
