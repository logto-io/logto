const domain = {
  status: {
    connecting: 'Conectando',
    in_used: 'Em uso',
    failed_to_connect: 'Falha na conexão',
  },
  update_endpoint_notice:
    'Não se esqueça de atualizar o domínio para o URI de retorno do conector social e o ponto de extremidade de logto em seu aplicativo se você quiser usar um domínio personalizado para os recursos. <a>{{link}}</a>',
  error_hint:
    'Certifique-se de atualizar seus registros DNS. Nós continuaremos a verificação a cada {{value}} segundos.',
  custom: {
    custom_domain: 'Domínio personalizado',
    custom_domain_description:
      'Melhore sua marca utilizando um domínio personalizado. Este domínio será utilizado em sua experiência de login.',
    custom_domain_field: 'Domínio personalizado',
    custom_domain_placeholder: 'seu.domínio.com',
    add_domain: 'Adicionar domínio',
    invalid_domain_format:
      'Formato de subdomínio inválido. Insira um subdomínio com pelo menos três partes.',
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
  },
  default: {
    default_domain: 'Domínio padrão',
    default_domain_description:
      'Logto oferece um domínio padrão pré-configurado, pronto para uso sem nenhuma configuração adicional. Este domínio padrão serve como uma opção de backup mesmo se você habilitou um domínio personalizado.',
    default_domain_field: 'Domínio padrão do Logto',
  },
};

export default domain;
