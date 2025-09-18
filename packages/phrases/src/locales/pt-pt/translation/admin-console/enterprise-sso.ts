const enterprise_sso = {
  page_title: 'SSO Empresarial',
  title: 'SSO Empresarial',
  subtitle: 'Conectar o provedor de identidade empresarial e ativar o Single Sign-On.',
  create: 'Adicionar conector empresarial',
  col_connector_name: 'Nome do conector',
  col_type: 'Tipo',
  col_email_domain: 'Domínio do email',
  placeholder_title: 'Conector empresarial',
  placeholder_description:
    'Logto disponibilizou muitos provedores de identidade empresarial integrados para conexão, entretanto, você pode criar o seu próprio com os protocolos SAML e OIDC.',
  create_modal: {
    title: 'Adicionar conector empresarial',
    text_divider: 'Ou você pode personalizar seu conector por um protocolo padrão.',
    connector_name_field_title: 'Nome do conector',
    connector_name_field_placeholder: 'E.g., {corp. name} - {identity provider name}',
    create_button_text: 'Criar conector',
  },
  guide: {
    subtitle: 'Um guia passo a passo para conectar o provedor de identidade empresarial.',
    finish_button_text: 'Continuar',
  },
  basic_info: {
    title: 'Configurar o seu serviço no IdP',
    description:
      'Crie uma nova integração de aplicativo usando SAML 2.0 no seu provedor de identidade {{name}}. Em seguida, cole o seguinte valor nele.',
    saml: {
      acs_url_field_name: 'URL do serviço de consumo de afirmação (URL de resposta)',
      audience_uri_field_name: 'URI do público (ID da entidade SP)',
      entity_id_field_name: 'ID da Entidade do Provedor de Serviço (SP)',
      entity_id_field_tooltip:
        'O ID da Entidade SP pode estar em qualquer formato de string, geralmente usando um formato de URI ou um formato de URL como identificador, mas isso não é obrigatório.',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'URI de redirecionamento (URL de retorno)',
      redirect_uri_field_description:
        'A URI de redirecionamento é para onde os utilizadores são enviados após a autenticação SSO. Adicione esta URI à configuração do seu IdP.',
      redirect_uri_field_custom_domain_description:
        'Se utilizar vários <a>domínios personalizados</a> no Logto, certifique-se de adicionar todas as URIs de callback correspondentes ao seu IdP para que o SSO funcione em cada domínio.\n\nO domínio predefinido do Logto (*.logto.app) é sempre válido; inclua-o apenas se também quiser suportar SSO nesse domínio.',
    },
  },
  attribute_mapping: {
    title: 'Mapeamento de atributos',
    description:
      '`id` e `email` são necessários para sincronizar o perfil do utilizador do IdP. Insira o seguinte nome de reivindicação e valor no seu IdP.',
    col_sp_claims: 'Valor do provedor de serviços (Logto)',
    col_idp_claims: 'Nome da reivindicação do provedor de identidade',
    idp_claim_tooltip: 'O nome da reivindicação do provedor de identidade',
  },
  metadata: {
    title: 'Configurar os metadados do IdP',
    description: 'Configure os metadados do provedor de identidade',
    dropdown_trigger_text: 'Utilizar outro método de configuração',
    dropdown_title: 'selecione o seu método de configuração',
    metadata_format_url: 'Introduza o URL do metadado',
    metadata_format_xml: 'Carregue o ficheiro XML do metadado',
    metadata_format_manual: 'Introduza detalhes do metadado manualmente',
    saml: {
      metadata_url_field_name: 'URL do metadado',
      metadata_url_description:
        'Busque dinamicamente os dados a partir do URL do metadado e mantenha o certificado atualizado.',
      metadata_xml_field_name: 'Ficheiro XML dos metadados do IdP',
      metadata_xml_uploader_text: 'Carregar ficheiro XML dos metadados',
      sign_in_endpoint_field_name: 'URL de início de sessão',
      idp_entity_id_field_name: 'ID da entidade do IdP (Emissor)',
      certificate_field_name: 'Certificado de assinatura',
      certificate_placeholder: 'Copie e cole o certificado x509',
      certificate_required: 'O certificado de assinatura é obrigatório.',
    },
    oidc: {
      client_id_field_name: 'ID de cliente',
      client_secret_field_name: 'Segredo de cliente',
      issuer_field_name: 'Emissor',
      scope_field_name: 'Âmbito',
      scope_field_placeholder: 'Introduza os âmbitos (separados por um espaço)',
    },
  },
};

export default Object.freeze(enterprise_sso);
