const domain = {
  status: {
    connecting: 'A conectar',
    in_used: 'Em uso',
    failed_to_connect: 'Falha ao conectar',
  },
  update_endpoint_alert: {
    description:
      'O seu domínio personalizado foi configurado com sucesso. Não se esqueça de atualizar o domínio que utilizou para {{domain}} caso tenha configurado os recursos abaixo anteriormente.',
    endpoint_url: 'URL de extremidade de <a>{{link}}</a>',
    application_settings_link_text: 'Definições da aplicação',
    callback_url: 'URL de retorno de chamada de <a>{{link}}</a>',
    social_connector_link_text: 'Conector social',
    api_identifier: 'Identificador de API de <a>{{link}}</a>',
    uri_management_api_link_text: 'API de gestão de URI',
    tip: 'Depois de alterar as definições, pode testá-las na nossa experiência de início de sessão <a>{{link}}</a>.',
  },
  custom: {
    custom_domain: 'Domínio personalizado',
    custom_domain_description:
      'Troque o domínio predefinido pelo seu próprio domínio para manter a consistência com a sua marca e personalizar a experiência de início de sessão para os seus utilizadores.',
    custom_domain_field: 'Domínio personalizado',
    custom_domain_placeholder: 'seudominio.com',
    add_domain: 'Adicionar domínio',
    invalid_domain_format: 'Formato de domínio inválido',
    steps: {
      add_records: {
        title: 'Adicione os seguintes registos DNS ao seu fornecedor de DNS',
        generating_dns_records: 'A gerar os registos DNS...',
        table: {
          type_field: 'Tipo',
          name_field: 'Nome',
          value_field: 'Valor',
        },
        finish_and_continue: 'Terminar e continuar',
      },
      verify_domain: {
        title: 'Verificar a ligação dos registos DNS automaticamente',
        description:
          'O processo será realizado automaticamente, o que pode demorar alguns minutos (até 24 horas). Pode sair desta interface enquanto é executado.',
        error_message: 'Falha na verificação. Verifique o seu nome de domínio ou registos DNS.',
      },
      generate_ssl_cert: {
        title: 'Gerar um certificado SSL automaticamente',
        description:
          'O processo será realizado automaticamente, o que pode demorar alguns minutos (até 24 horas). Pode sair desta interface enquanto é executado.',
        error_message: 'Falha na geração do Certificado SSL.',
      },
      enable_domain: 'Ativar o seu domínio personalizado automaticamente',
    },
    deletion: {
      delete_domain: 'Eliminar domínio',
      reminder: 'Eliminar domínio personalizado',
      description: 'Tem a certeza de que pretende eliminar este domínio personalizado?',
      in_used_description:
        'Tem a certeza de que pretende eliminar este domínio personalizado "{{domain}}"?',
      in_used_tip:
        'Se tiver configurado este domínio personalizado no seu fornecedor de conector social ou no ponto final da aplicação antes, terá de modificar a URI para o domínio personalizado da Logto "{{domain}}" primeiro. Isto é necessário para que o botão de início de sessão social funcione corretamente.',
      deleted: 'Domínio personalizado eliminado com sucesso!',
    },
  },
  default: {
    default_domain: 'Domínio predefinido',
    default_domain_description:
      'Fornecemos um nome de domínio predefinido que pode ser utilizado diretamente online. Está sempre disponível, garantindo que a sua aplicação possa sempre ser acedida para início de sessão, mesmo que mude para um domínio personalizado.',
    default_domain_field: 'Domínio predefinido da Logto',
  },
};

export default domain;
