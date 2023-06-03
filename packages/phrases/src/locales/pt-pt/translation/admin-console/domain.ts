const domain = {
  status: {
    connecting: 'A conectar',
    in_used: 'Em uso',
    failed_to_connect: 'Falha ao conectar',
  },
  update_endpoint_alert: {
    description:
      'O seu domínio personalizado foi configurado com sucesso. Não se esqueça de atualizar o domínio que utilizou para <span>{{domain}}</span> caso tenha configurado os recursos abaixo anteriormente.',
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
    custom_domain_placeholder: 'your.domain.com',
    add_domain: 'Adicionar domínio',
    invalid_domain_format:
      'Formato de subdomínio inválido. Introduza um subdomínio com pelo menos três partes.',
    verify_domain: 'Verificar domínio',
    enable_ssl: 'Ativar SSL',
    checking_dns_tip:
      'Após a configuração dos registos DNS, o processo será executado automaticamente e pode demorar até 24 horas. Pode sair desta interface enquanto o processo estiver em execução.',
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
  },
  default: {
    default_domain: 'Domínio predefinido',
    default_domain_description:
      'Fornecemos um nome de domínio predefinido que pode ser utilizado diretamente online. Está sempre disponível, garantindo que a sua aplicação possa sempre ser acedida para início de sessão, mesmo que mude para um domínio personalizado.',
    default_domain_field: 'Domínio predefinido da Logto',
  },
};

export default domain;
