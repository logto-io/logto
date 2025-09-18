const enterprise_sso = {
  page_title: 'SSO Empresarial',
  title: 'SSO Empresarial',
  subtitle: 'Conecte o provedor de identidade empresarial e habilite o Single Sign-On.',
  create: 'Adicionar conector empresarial',
  col_connector_name: 'Nome do conector',
  col_type: 'Tipo',
  col_email_domain: 'Domínio de e-mail',
  placeholder_title: 'Conector empresarial',
  placeholder_description:
    'O Logto forneceu muitos provedores de identidade corporativa integrados para conexão. Ao mesmo tempo, você pode criar o seu próprio com os protocolos SAML e OIDC.',
  create_modal: {
    title: 'Adicionar conector empresarial',
    text_divider: 'Ou você pode personalizar seu conector usando um protocolo padrão.',
    connector_name_field_title: 'Nome do conector',
    connector_name_field_placeholder:
      'Por exemplo, {nome da empresa} - {nome do provedor de identidade}',
    create_button_text: 'Criar conector',
  },
  guide: {
    subtitle: 'Um guia passo a passo para conectar o provedor de identidade empresarial.',
    finish_button_text: 'Continuar',
  },
  basic_info: {
    title: 'Configure seu serviço no IdP',
    description:
      'Crie uma nova integração de aplicativo por SAML 2.0 em seu provedor de identidade {{name}}. Em seguida, cole o seguinte valor nele.',
    saml: {
      acs_url_field_name: 'URL do serviço de consumidor de afirmações (URL de resposta)',
      audience_uri_field_name: 'URI do público (ID da entidade SP)',
      entity_id_field_name: 'ID da entidade do provedor de serviço (SP)',
      entity_id_field_tooltip:
        'O ID da entidade SP pode estar em qualquer formato de string, normalmente usando um formato de URI ou URL como identificador, mas isso não é obrigatório.',
      acs_url_field_placeholder: 'https://seu-dominio.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:seu-dominio.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'URL de redirecionamento (URL de retorno de chamada)',
      redirect_uri_field_description:
        'A URI de redirecionamento é para onde os usuários são enviados após a autenticação SSO. Adicione essa URI à configuração do seu IdP.',
      redirect_uri_field_custom_domain_description:
        'Se você usa vários <a>domínios personalizados</a> no Logto, lembre-se de adicionar todas as URIs de callback correspondentes ao seu IdP para que o SSO funcione em cada domínio.\n\nO domínio padrão do Logto (*.logto.app) é sempre válido; inclua-o apenas se também quiser oferecer suporte a SSO nesse domínio.',
    },
  },
  attribute_mapping: {
    title: 'Mapeamento de atributos',
    description:
      '`id` e `email` são necessários para sincronizar o perfil do usuário do IdP. Insira o seguinte nome de reivindicação e valor no seu IdP.',
    col_sp_claims: 'Valor do provedor de serviços (Logto)',
    col_idp_claims: 'Nome da reivindicação do provedor de identidade',
    idp_claim_tooltip: 'O nome da reivindicação do provedor de identidade',
  },
  metadata: {
    title: 'Configure os metadados do IdP',
    description: 'Configure os metadados do provedor de identidade',
    dropdown_trigger_text: 'Usar outro método de configuração',
    dropdown_title: 'selecione seu método de configuração',
    metadata_format_url: 'Insira a URL do metadado',
    metadata_format_xml: 'Enviar o arquivo XML de metadados',
    metadata_format_manual: 'Insira os detalhes dos metadados manualmente',
    saml: {
      metadata_url_field_name: 'URL do metadado',
      metadata_url_description:
        'Buscar dinamicamente dados da URL do metadado e manter o certificado atualizado.',
      metadata_xml_field_name: 'Arquivo XML de metadados do IdP',
      metadata_xml_uploader_text: 'Enviar arquivo XML de metadados',
      sign_in_endpoint_field_name: 'URL de logon',
      idp_entity_id_field_name: 'ID da entidade do IdP (Emissor)',
      certificate_field_name: 'Certificado de assinatura',
      certificate_placeholder: 'Copie e cole o certificado x509',
      certificate_required: 'O certificado de assinatura é obrigatório.',
    },
    oidc: {
      client_id_field_name: 'ID do cliente',
      client_secret_field_name: 'Segredo do cliente',
      issuer_field_name: 'Emissor',
      scope_field_name: 'Escopo',
      scope_field_placeholder: 'Insira os escopos (separados por um espaço)',
    },
  },
};

export default Object.freeze(enterprise_sso);
