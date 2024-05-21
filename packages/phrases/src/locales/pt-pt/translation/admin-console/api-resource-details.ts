const api_resource_details = {
  page_title: 'Detalhes do recurso da API',
  back_to_api_resources: 'Voltar aos recursos da API',
  general_tab: 'Geral',
  permissions_tab: 'Permissões',
  settings: 'Definições',
  settings_description:
    'Os recursos da API, também conhecidos como indicadores de recursos, indicam os serviços ou recursos de destino a serem solicitados, geralmente uma variável no formato URI que representa a identidade do recurso.',
  management_api_settings_description:
    'A API de Gestão do Logto é uma coleção abrangente de APIs que capacitam os administradores a gerenciar uma ampla gama de tarefas relacionadas à identidade, aplicar políticas de segurança e cumprir regulamentos e padrões.',
  management_api_notice:
    'Esta API representa a entidade Logto e não pode ser modificada ou eliminada. Você pode usar a API de gestão para uma ampla gama de tarefas relacionadas à identidade. <a>Saiba mais</a>',
  token_expiration_time_in_seconds: 'Tempo de expiração do token (em segundos)',
  token_expiration_time_in_seconds_placeholder: 'Insira o tempo de expiração do token',
  delete_description:
    'Esta ação não pode ser desfeita. Isso irá eliminar permanentemente o recurso da API. Insira o nome do recurso <span>{{name}}</span> para confirmar.',
  enter_your_api_resource_name: 'Digite o nome do recurso da API',
  api_resource_deleted: 'O recurso da API {{name}} foi eliminado com sucesso',
  permission: {
    create_button: 'Criar permissão',
    create_title: 'Criar permissão',
    create_subtitle: 'Define as permissões (escopos) necessários para essa API.',
    confirm_create: 'Criar permissão',
    edit_title: 'Editar permissão da API',
    edit_subtitle: 'Define as permissões (escopos) necessários pela API {{resourceName}}.',
    name: 'Nome da permissão',
    name_placeholder: 'leitura:recurso',
    forbidden_space_in_name: 'O nome da permissão não pode conter espaços.',
    description: 'Descrição',
    description_placeholder: 'Capaz de ler os recursos',
    permission_created: 'A permissão {{name}} foi criada com sucesso',
    delete_description:
      'Se esta permissão for excluída, o usuário que tinha esta permissão perderá o acesso concedido por ela.',
    deleted: 'A permissão "{{name}}" foi excluída com sucesso.',
  },
};

export default Object.freeze(api_resource_details);
