const domain = {
  status: {
    connecting: 'A conectar...',
    in_use: 'Em uso',
    failed_to_connect: 'Falha ao conectar',
  },
  update_endpoint_notice:
    'Não se esqueça de atualizar o domínio para o URI de retorno do conector social e o endpoint de Logto na sua aplicação se quiser usar um domínio personalizado para as funcionalidades.',
  error_hint:
    'Certifique-se de atualizar os seus registos DNS. Continuaremos a verificar a cada {{value}} segundos.',
  custom: {
    custom_domain: 'Domínios personalizados',
    custom_domain_description:
      'Melhore a sua marca utilizando um domínio personalizado. Este domínio será utilizado na sua experiência de início de sessão.',
    custom_domain_field: 'Domínios personalizados',
    custom_domain_placeholder: 'auth.domain.com',
    add_custom_domain_field: 'Adicionar um domínio personalizado',
    custom_domains_field: 'Domínios personalizados',
    add_domain: 'Adicionar domínio',
    invalid_domain_format:
      'Por favor, forneça um URL de domínio válido com um mínimo de três partes, por exemplo, "auth.domain.com."',
    verify_domain: 'Verificar domínio',
    enable_ssl: 'Ativar SSL',
    checking_dns_tip:
      'Após a configuração dos registos DNS, o processo será executado automaticamente e pode demorar até 24 horas. Pode sair desta interface enquanto o processo estiver em execução.',
    enable_ssl_tip:
      'Ativar SSL será executado automaticamente e pode demorar até 24 horas. Pode sair desta interface enquanto o processo estiver em execução.',
    generating_dns_records: 'Gerando os registos DNS...',
    add_dns_records: 'Adicione estes registos DNS ao seu provedor de DNS.',
    dns_table: {
      type_field: 'Tipo',
      name_field: 'Nome',
      value_field: 'Valor',
    },
    deletion: {
      delete_domain: 'Eliminar domínio',
      reminder: 'Eliminar domínio personalizado',
      description: 'Tem a certeza de que pretende eliminar este domínio personalizado?',
      in_used_description:
        'Tem a certeza de que pretende eliminar este domínio personalizado "<span>{{domain}}</span>"?',
      in_used_tip:
        'Se já configurou este domínio personalizado no seu fornecedor de conector social ou extremidade de aplicação antes, terá de modificar a URI para o domínio padrão do Logto "<span>{{domain}}</span>" primeiro. Isto é necessário para que o botão de início de sessão social funcione corretamente.',
      deleted: 'Domínio personalizado eliminado com sucesso!',
    },
    config_custom_domain_description:
      'Configure domínios personalizados para configurar os seguintes recursos: aplicações, conectores sociais e conectores empresariais.',
  },
  default: {
    default_domain: 'Domínio predefinido',
    default_domain_description:
      'Logto oferece um domínio predefinido pré-configurado, pronto para usar sem qualquer configuração adicional. Este domínio predefinido serve como opção de backup mesmo que tenha ativado um domínio personalizado.',
    default_domain_field: 'Domínio predefinido da Logto',
  },
  custom_endpoint_note:
    'Pode personalizar o nome de domínio desses endpoints conforme necessário. Escolha "{{custom}}" ou "{{default}}".',
  custom_social_callback_url_note:
    'Pode personalizar o nome de domínio deste URI para corresponder ao endpoint da sua aplicação. Escolha "{{custom}}" ou "{{default}}".',
  custom_acs_url_note:
    'Pode personalizar o nome de domínio deste URI para corresponder ao URL do serviço de consumidor de confirmação do seu fornecedor de identidade. Escolha "{{custom}}" ou "{{default}}".',
  switch_custom_domain_tip:
    'Altere o seu domínio para ver o endpoint correspondente. Adicione mais domínios através de <a>domínios personalizados</a>.',
  switch_saml_app_domain_tip:
    'Altere o seu domínio para ver os URLs correspondentes. Nos protocolos SAML, os URLs de metadados podem ser alojados em qualquer domínio acessível. Contudo, o domínio selecionado determina o URL de serviço SSO que os SP utilizam para redirecionar os utilizadores finais para autenticação, o que afeta a experiência de início de sessão e a visibilidade do URL.',
  switch_saml_connector_domain_tip:
    'Altere de domínio para ver os URLs correspondentes. O domínio selecionado determina o seu URL ACS, afetando para onde os utilizadores são redirecionados após o início de sessão SSO. Escolha o domínio que corresponde ao comportamento de redirecionamento esperado da sua aplicação.',
};

export default Object.freeze(domain);
