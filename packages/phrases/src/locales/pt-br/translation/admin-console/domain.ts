const domain = {
  status: {
    connecting: 'Conectando...',
    in_use: 'Em uso',
    failed_to_connect: 'Falha na conexão',
  },
  update_endpoint_notice:
    'Não se esqueça de atualizar o domínio para o URI de retorno do conector social e o ponto de extremidade de logto em seu aplicativo se você quiser usar um domínio personalizado para os recursos.',
  error_hint:
    'Certifique-se de atualizar seus registros DNS. Nós continuaremos a verificação a cada {{value}} segundos.',
  custom: {
    custom_domain: 'Domínios personalizados',
    custom_domain_description:
      'Melhore sua marca utilizando um domínio personalizado. Este domínio será utilizado em sua experiência de login.',
    custom_domain_field: 'Domínios personalizados',
    custom_domain_placeholder: 'auth.domain.com',
    add_custom_domain_field: 'Adicionar um domínio personalizado',
    custom_domains_field: 'Domínios personalizados',
    add_domain: 'Adicionar domínio',
    invalid_domain_format:
      'Por favor, forneça uma URL de domínio válida com um mínimo de três partes, por exemplo, "auth.domain.com."',
    verify_domain: 'Verificar domínio',
    enable_ssl: 'Habilitar SSL',
    checking_dns_tip:
      'Após configurar os registros DNS, o processo será iniciado automaticamente e pode levar até 24 horas. Você pode deixar esta interface enquanto o processo é executado.',
    enable_ssl_tip:
      'Habilitar SSL será executado automaticamente e pode levar até 24 horas. Você pode deixar esta interface enquanto o processo é executado.',
    generating_dns_records: 'Gerando os registros DNS...',
    add_dns_records: 'Por favor, adicione estes registros DNS ao seu provedor DNS.',
    dns_table: {
      type_field: 'Tipo',
      name_field: 'Nome',
      value_field: 'Valor',
    },
    deletion: {
      delete_domain: 'Excluir domínio',
      reminder: 'Excluir domínio personalizado',
      description: 'Tem certeza de que deseja excluir este domínio personalizado?',
      in_used_description:
        'Tem certeza de que deseja excluir este domínio personalizado "<span>{{domain}}</span>"?',
      in_used_tip:
        'Se você configurou este domínio personalizado em seu provedor de conexão social ou ponto de extremidade de aplicativo antes, você precisará modificar a URI para o domínio padrão do Logto "<span>{{domain}}</span>" primeiro. Isso é necessário para que o botão de login social funcione corretamente.',
      deleted: 'Domínio personalizado excluído com sucesso!',
    },
    config_custom_domain_description:
      'Configure domínios personalizados para definir os seguintes recursos: aplicativos, conectores sociais e conectores empresariais.',
  },
  default: {
    default_domain: 'Domínio padrão',
    default_domain_description:
      'Logto oferece um domínio padrão pré-configurado, pronto para uso sem nenhuma configuração adicional. Este domínio padrão serve como uma opção de backup mesmo se você habilitou um domínio personalizado.',
    default_domain_field: 'Domínio padrão do Logto',
  },
  custom_endpoint_note:
    'Você pode personalizar o nome de domínio desses endpoints conforme necessário. Escolha "{{custom}}" ou "{{default}}".',
  custom_social_callback_url_note:
    'Você pode personalizar o nome de domínio desta URI para corresponder ao endpoint de seu aplicativo. Escolha "{{custom}}" ou "{{default}}".',
  custom_acs_url_note:
    'Você pode personalizar o nome de domínio desta URI para corresponder à URL do serviço consumidor de assertividade de seu provedor de identidade. Escolha "{{custom}}" ou "{{default}}".',
  switch_custom_domain_tip:
    'Altere seu domínio para ver o endpoint correspondente. Adicione mais domínios via <a>domínios personalizados</a>.',
  switch_saml_app_domain_tip:
    'Altere seu domínio para ver as URLs correspondentes. Em protocolos SAML, as URLs de metadados podem ser hospedadas em qualquer domínio acessível. Porém, o domínio selecionado determina a URL de serviço SSO que os SPs usam para redirecionar os usuários para autenticação, afetando a experiência de login e a visibilidade da URL.',
  switch_saml_connector_domain_tip:
    'Altere o domínio para ver as URLs correspondentes. O domínio selecionado determina sua URL ACS, que afeta para onde os usuários são redirecionados após o login SSO. Escolha o domínio que corresponda ao comportamento de redirecionamento esperado do seu aplicativo.',
};

export default Object.freeze(domain);
