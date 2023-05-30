const domain = {
  status: {
    connecting: 'Conectando',
    in_used: 'Em uso',
    failed_to_connect: 'Falha na conexão',
  },
  update_endpoint_alert: {
    description:
      'Seu domínio personalizado foi configurado com sucesso. Não se esqueça de atualizar o domínio que você usou para {{domain}} se você já configurou os recursos abaixo anteriormente.',
    endpoint_url: 'URL do ponto de extremidade de <a>{{link}}</a>',
    application_settings_link_text: 'Configurações de aplicativo',
    callback_url: 'URL de retorno de chamada de <a>{{link}}</a>',
    social_connector_link_text: 'Conector social',
    api_identifier: 'Identificador de API de <a>{{link}}</a>',
    uri_management_api_link_text: 'API de Gerenciamento de URI',
    tip: 'Após alterar as configurações, você pode testá-las em nossa experiência de login <a>{{link}}</a>.',
  },
  custom: {
    custom_domain: 'Domínio personalizado',
    custom_domain_description:
      'Substitua o domínio padrão pelo seu próprio domínio para manter a consistência com sua marca e personalizar a experiência de login para seus usuários.',
    custom_domain_field: 'Domínio personalizado',
    custom_domain_placeholder: 'seudominio.com',
    add_domain: 'Adicionar domínio',
    invalid_domain_format: 'Formato de domínio inválido',
    steps: {
      add_records: {
        title: 'Adicionar os seguintes registros DNS ao seu provedor DNS',
        generating_dns_records: 'Gerando os registros DNS...',
        table: {
          type_field: 'Tipo',
          name_field: 'Nome',
          value_field: 'Valor',
        },
        finish_and_continue: 'Concluir e continuar',
      },
      verify_domain: {
        title: 'Verifique a conexão dos registros DNS automaticamente',
        description:
          'O processo será realizado automaticamente, o que pode levar alguns minutos (até 24 horas). Você pode sair desta interface enquanto ele é executado.',
        error_message: 'Falha ao verificar. Verifique seu nome de domínio ou Registros DNS.',
      },
      generate_ssl_cert: {
        title: 'Gerar um certificado SSL automaticamente',
        description:
          'O processo será realizado automaticamente, o que pode levar alguns minutos (até 24 horas). Você pode sair desta interface enquanto ele é executado.',
        error_message: 'Falha ao gerar o Certificado SSL. ',
      },
      enable_domain: 'Ativar seu domínio personalizado automaticamente',
    },
    deletion: {
      delete_domain: 'Excluir domínio',
      reminder: 'Excluir domínio personalizado',
      description: 'Tem certeza de que deseja excluir este domínio personalizado?',
      in_used_description:
        'Tem certeza de que deseja excluir este domínio personalizado "{{domain}}"?',
      in_used_tip:
        'Se você configurou este domínio personalizado em seu provedor de conector social ou endpoint de aplicativo antes, será necessário modificar a URI para o domínio personalizado de Logto "{{domain}}" primeiro. Isso é necessário para que o botão de login social funcione corretamente.',
      deleted: 'Domínio personalizado excluído com sucesso!',
    },
  },
  default: {
    default_domain: 'Domínio padrão',
    default_domain_description:
      'Fornecemos um nome de domínio padrão que pode ser usado diretamente online. Está sempre disponível, garantindo que seu aplicativo possa sempre ser acessado para login, mesmo se você mudar para um domínio personalizado.',
    default_domain_field: 'Domínio padrão do Logto',
  },
};

export default domain;
