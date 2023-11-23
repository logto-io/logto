const enterprise_sso = {
  page_title: 'SSO Empresarial',
  title: 'SSO Empresarial',
  subtitle:
    'Conecte o fornecedor de identidade empresarial e ative o Logon Único iniciado pelo SP.',
  create: 'Adicionar conector empresarial',
  col_connector_name: 'Nome do conector',
  col_type: 'Tipo',
  col_email_domain: 'Domínio do email',
  col_status: 'Estado',
  col_status_in_use: 'Em uso',
  col_status_invalid: 'Inválido',
  placeholder_title: 'Conector empresarial',
  placeholder_description:
    'Logto forneceu muitos provedores de identidade empresarial integrados para conectar, ao mesmo tempo, você pode criar o seu próprio com protocolos padrão.',
  create_modal: {
    title: 'Adicionar conector empresarial',
    text_divider: 'Ou você pode personalizar seu conector por um protocolo padrão.',
    connector_name_field_title: 'Nome do conector',
    connector_name_field_placeholder: 'Nome do provedor de identidade empresarial',
    create_button_text: 'Criar conector',
  },
  guide: {
    subtitle: 'Um guia passo a passo para conectar o fornecedor de identidade empresarial.',
    finish_button_text: 'Continuar',
  },
  basic_info: {
    title: 'Configure o seu serviço no IdP',
    description:
      'Crie uma nova integração de aplicação por SAML 2.0 no seu fornecedor de identidade {{name}}. Depois cole o seguinte valor nele.',
    saml: {
      acs_url_field_name: 'URL do serviço de consumidor de afirmações (URL de resposta)',
      audience_uri_field_name: 'URI da audiência (ID da entidade do SP)',
    },
    oidc: {
      redirect_uri_field_name: 'URI de redirecionamento (URL de retorno)',
    },
  },
  attribute_mapping: {
    title: 'Mapeamento de atributos',
    description:
      '`id` e `email` são necessários para sincronizar o perfil do utilizador do IdP. Insira o nome da reivindicação e o valor a seguir no seu IdP.',
    col_sp_claims: 'Nome da reivindicação do Logto',
    col_idp_claims: 'Nome da reivindicação do fornecedor de identidade',
    idp_claim_tooltip: 'O nome da reivindicação do fornecedor de identidade',
  },
  metadata: {
    title: 'Configure os metadados do IdP',
    description: 'Configure os metadados do fornecedor de identidade',
    dropdown_trigger_text: 'Usar outro método de configuração',
    dropdown_title: 'selecione o seu método de configuração',
    metadata_format_url: 'Introduza o URL dos metadados',
    metadata_format_xml: 'Carregue o ficheiro XML dos metadados',
    metadata_format_manual: 'Introduza os detalhes dos metadados manualmente',
    saml: {
      metadata_url_field_name: 'URL dos metadados',
      metadata_url_description:
        'Obtenha dinamicamente os dados a partir do URL dos metadados e mantenha o certificado atualizado.',
      metadata_xml_field_name: 'Ficheiro XML dos metadados',
      metadata_xml_uploader_text: 'Carregar ficheiro XML dos metadados',
      sign_in_endpoint_field_name: 'URL de início de sessão',
      idp_entity_id_field_name: 'ID da entidade do IdP (Emissor)',
      certificate_field_name: 'Certificado de assinatura',
      certificate_placeholder: 'Copie e cole o certificado x509',
    },
    oidc: {
      client_id_field_name: 'ID do cliente',
      client_secret_field_name: 'Segredo do cliente',
      issuer_field_name: 'Emissor',
      scope_field_name: 'Âmbito',
    },
  },
};

export default Object.freeze(enterprise_sso);
