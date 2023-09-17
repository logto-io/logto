const api_resource_details = {
  /** UNTRANSLATED */
  management_api_notice:
    'This API represents Logto entity and can not be modified or deleted. You can use management API for a wide range of identity-related tasks. <a>{{link}}</a>',
  /** UNTRANSLATED */
  management_api_notice_link_text: 'Learn more',
  page_title: 'Detalhes do Recurso da API',
  back_to_api_resources: 'Voltar para os recursos da API',
  settings_tab: 'Configurações',
  permissions_tab: 'Permissões',
  settings: 'Configurações',
  settings_description:
    'Os recursos da API, também conhecidos como Indicadores de recursos, indicam os serviços ou recursos de destino a serem solicitados, geralmente uma variável de formato de URI que representa a identidade do recurso.',
  management_api_settings_description:
    'A API de Gerenciamento do Logto é uma coleção abrangente de APIs que capacitam os administradores a gerenciar uma ampla gama de tarefas relacionadas à identidade, aplicar políticas de segurança e cumprir regulamentos e padrões.',
  token_expiration_time_in_seconds: 'Tempo de expiração do token (em segundos)',
  token_expiration_time_in_seconds_placeholder: 'Digite o tempo de expiração do seu token',
  delete_description:
    'Essa ação não pode ser desfeita. Isso excluirá permanentemente o recurso da API. Insira o nome do recurso de API <span>{{name}}</span> para confirmar.',
  enter_your_api_resource_name: 'Digite o nome do recurso da API',
  api_resource_deleted: 'O recurso da API {{name}} foi excluído com sucesso',
  permission: {
    create_button: 'Criar Permissão',
    create_title: 'Criar permissão',
    create_subtitle: 'Define as permissões (escopos) necessárias para esta API.',
    confirm_create: 'Criar permissão',
    name: 'Nome da permissão',
    name_placeholder: 'ler:recurso',
    forbidden_space_in_name: 'O nome da permissão não deve conter espaços.',
    description: 'Descrição',
    description_placeholder: 'Capaz de ler os recursos',
    permission_created: 'A permissão {{name}} foi criada com sucesso',
    delete_description:
      'Se essa permissão for excluída, o usuário que tinha essa permissão perderá o acesso concedido por ela.',
    deleted: 'A permissão "{{name}}" foi excluída com sucesso.',
  },
};

export default Object.freeze(api_resource_details);
