const tenants = {
  title: 'Definições',
  description: 'Gerir eficientemente as configurações do inquilino e personalizar o seu domínio.',
  tabs: {
    settings: 'Definições',
    members: 'Membros',
    domains: 'Domínios',
    subscription: 'Plano e faturação',
    billing_history: 'Histórico de faturação',
  },
  settings: {
    title: 'DEFINIÇÕES',
    description:
      'Defina o nome do inquilino e veja a região de hospedagem dos seus dados e o tipo de inquilino.',
    tenant_id: 'ID do Inquilino',
    tenant_name: 'Nome do Inquilino',
    tenant_region: 'Região de hospedagem',
    tenant_region_tip:
      'Os recursos do seu inquilino são hospedados na região {{region}}. <a>Learn more</a>',
    environment_tag_development: 'Dev',
    environment_tag_production: 'Prod',
    tenant_type: 'Tipo de inquilino',
    development_description:
      'Apenas para testes e não deve ser usado em produção. Não é necessário nenhum plano de subscrição. Tem todas as funcionalidades profissionais, mas tem limitações, como um banner de início de sessão. <a>Learn more</a>',
    production_description:
      'Destinado a aplicações que estão a ser utilizadas por utilizadores finais e que podem exigir uma subscrição paga. <a>Learn more</a>',
    tenant_info_saved: 'A informação do inquilino foi guardada com sucesso.',
  },
  full_env_tag: {
    development: 'Desenvolvimento',
    production: 'Produção',
  },
  deletion_card: {
    title: 'ELIMINAR',
    tenant_deletion: 'Eliminar inquilino',
    tenant_deletion_description:
      'A eliminação do inquilino resultará na remoção permanente de todos os dados de utilizador e configuração associados. Por favor, proceda com cuidado.',
    tenant_deletion_button: 'Eliminar inquilino',
  },
  leave_tenant_card: {
    title: 'SAIR',
    leave_tenant: 'Sair do inquilino',
    leave_tenant_description:
      'Quaisquer recursos no inquilino permanecerão, mas deixará de ter acesso a este inquilino.',
    last_admin_note:
      'Para sair deste inquilino, certifique-se de que pelo menos mais um membro tem a função de Administrador.',
  },
  create_modal: {
    title: 'Criar inquilino',
    tenant_usage_purpose: 'Para que pretende utilizar este inquilino?',
    development_description:
      'Apenas para testes e não deve ser usado em produção. Não é necessário nenhum plano de subscrição.',
    development_hint:
      'Tem todas as funcionalidades profissionais, mas tem limitações, como um banner de início de sessão.',
    production_description: 'Para uso por utilizadores finais e pode exigir uma subscrição paga.',
    available_plan: 'Plano disponível:',
    create_button: 'Criar inquilino',
    tenant_name_placeholder: 'Meu inquilino',
  },
  dev_tenant_migration: {
    title:
      'Agora pode experimentar gratuitamente as nossas funcionalidades Pro ao criar um novo "inquilino de desenvolvimento"!',
    affect_title: 'Como isto o afeta?',
    hint_1:
      'Estamos a substituir as antigas <strong>etiquetas de ambiente</strong> por dois novos tipos de inquilino: <strong>“Desenvolvimento”</strong> e <strong>“Produção”</strong>.',
    hint_2:
      'Para garantir uma transição sem problemas e funcionalidade ininterrupta, todos os inquilinos criados anteriormente serão elevados ao tipo de inquilino <strong>Produção</strong> juntamente com a sua subscrição anterior.',
    hint_3: 'Não se preocupe, todas as outras definições permanecerão as mesmas.',
    about_tenant_type: 'Sobre o tipo de inquilino',
  },
  delete_modal: {
    title: 'Eliminar inquilino',
    description_line1:
      'Tem a certeza de que deseja eliminar o seu inquilino "<span>{{name}}</span>" com a etiqueta de sufixo de ambiente "<span>{{tag}}</span>"? Esta ação não pode ser desfeita e resultará na eliminação permanente de todos os seus dados e informações do inquilino.',
    description_line2:
      'Antes de excluir o inquilino, talvez possamos ajudá-lo. <span><a>Contacte-nos por email</a></span>',
    description_line3:
      'Se quiser continuar, introduza o nome do inquilino "<span>{{name}}</span>" para confirmar.',
    delete_button: 'Eliminar permanentemente',
    cannot_delete_title: 'Não é possível apagar este inquilino',
    cannot_delete_description:
      'Desculpe, não é possível apagar este inquilino neste momento. Certifique-se de estar no Plano Gratuito e ter pago todas as faturas em atraso.',
  },
  leave_tenant_modal: {
    description: 'Tem a certeza de que deseja sair deste inquilino?',
    leave_button: 'Sair',
  },
  tenant_landing_page: {
    title: 'Ainda não criou um inquilino',
    description:
      'Para começar a configurar o seu projeto com o Logto, crie um novo inquilino. Se precisar de fazer logout ou excluir a sua conta, basta clicar no botão avatar no canto superior direito.',
    create_tenant_button: 'Criar inquilino',
  },
  status: {
    mau_exceeded: 'Limite MAU Excedido',
    suspended: 'Suspenso',
    overdue: 'Atrasado',
  },
  tenant_suspended_page: {
    title: 'Inquilino suspenso. Contacte-nos para restaurar o acesso.',
    description_1:
      'Lamentamos informar que a sua conta de inquilino foi temporariamente suspensa devido a uso indevido, incluindo exceder os limites de MAU, pagamentos em atraso ou outras ações não autorizadas.',
    description_2:
      'Se precisar de mais esclarecimentos, tiver alguma preocupação ou desejar restaurar a funcionalidade completa e desbloquear os seus inquilinos, não hesite em contactar-nos imediatamente.',
  },
};

export default Object.freeze(tenants);
