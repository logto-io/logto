const enterprise_sso_details = {
  back_to_sso_connectors: 'Regressar aos conectores SSO empresariais',
  page_title: 'Detalhes do conector SSO empresarial',
  readme_drawer_title: 'SSO empresarial',
  readme_drawer_subtitle:
    'Configurar conectores SSO empresariais para permitir SSO para os utilizadores finais',
  tab_settings: 'Definições',
  tab_connection: 'Conexão',
  general_settings_title: 'Definições gerais',
  custom_branding_title: 'Marca personalizada',
  custom_branding_description:
    'Personalize a informação de exibição do IdP empresarial para o botão de login e outros cenários.',
  email_domain_field_name: 'Domínio de email empresarial',
  email_domain_field_description:
    'Os utilizadores com este domínio de email podem utilizar o SSO para autenticação. Certifique-se de que o domínio pertence à empresa.',
  email_domain_field_placeholder: 'Domínio de email',
  sync_profile_field_name:
    'Sincronizar informações do perfil provenientes do fornecedor de identidade',
  sync_profile_option: {
    register_only: 'Apenas sincronizar no primeiro login',
    each_sign_in: 'Sincronizar sempre em cada login',
  },
  connector_name_field_name: 'Nome do conector',
  connector_logo_field_name: 'Logótipo do conector',
  branding_logo_context: 'Carregar logótipo',
  branding_logo_error: 'Erro ao carregar o logótipo: {{error}}',
  branding_logo_field_name: 'Logótipo',
  branding_logo_field_placeholder: 'https://seu.domínio/logo.png',
  branding_dark_logo_context: 'Carregar logótipo de modo escuro',
  branding_dark_logo_error: 'Erro ao carregar o logótipo de modo escuro: {{error}}',
  branding_dark_logo_field_name: 'Logótipo (modo escuro)',
  branding_dark_logo_field_placeholder: 'https://seu.domínio/logótipo-modo-escuro.png',
  check_readme: 'Verificar README',
  enterprise_sso_deleted: 'O conector SSO empresarial foi eliminado com sucesso',
  delete_confirm_modal_title: 'Eliminar conector SSO empresarial',
  delete_confirm_modal_content:
    'Tem a certeza de que pretende eliminar este conector empresarial? Utilizadores dos fornecedores de identidade não utilizarão a autenticação Single Sign-On.',
  upload_idp_metadata_title: 'Carregar metadados IdP',
  upload_idp_metadata_description: 'Configurar os metadados copiados do fornecedor de identidade.',
  upload_saml_idp_metadata_info_text_url:
    'Cole o URL dos metadados do fornecedor de identidade para estabelecer ligação.',
  upload_saml_idp_metadata_info_text_xml:
    'Cole os metadados do fornecedor de identidade para estabelecer ligação.',
  upload_saml_idp_metadata_info_text_manual:
    'Preencha os metadados do fornecedor de identidade para estabelecer ligação.',
  upload_oidc_idp_info_text:
    'Preencha as informações do fornecedor de identidade para estabelecer ligação.',
  service_provider_property_title: 'Configurar o seu serviço no IdP',
  service_provider_property_description:
    'Crie uma nova integração de aplicação por {{protocol}} no seu {{name}}. Depois cole os seguintes detalhes do fornecedor de serviços para configurar {{protocol}}.',
  attribute_mapping_title: 'Mapeamento de atributos',
  attribute_mapping_description:
    'Os atributos `id` e `email` do utilizador são necessários para sincronizar o perfil do utilizador do IdP. Introduza o seguinte nome e valor em {{name}}.',
  saml_preview: {
    sign_on_url: 'URL de início de sessão',
    entity_id: 'Emissor',
    x509_certificate: 'Certificado de assinatura',
  },
  oidc_preview: {
    authorization_endpoint: 'Ponto de autorização',
    token_endpoint: 'Ponto de token',
    userinfo_endpoint: 'Ponto de informação do utilizador',
    jwks_uri: 'Ponto final do conjunto de chaves JSON Web',
    issuer: 'Emissor',
  },
};

export default Object.freeze(enterprise_sso_details);
