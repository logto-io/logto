const tenants = {
  title: 'Configurações',
  description: 'Gerencie eficientemente as configurações do locatário e personalize seu domínio.',
  tabs: {
    settings: 'Configurações',
    members: 'Membros',
    domains: 'Domínios',
    subscription: 'Plano e faturamento',
    billing_history: 'Histórico de faturamento',
  },
  settings: {
    title: 'CONFIGURAÇÕES',
    description:
      'Defina o nome do locatário e visualize a região de hospedagem dos seus dados e o tipo de locatário.',
    tenant_id: 'ID do Locatário',
    tenant_name: 'Nome do Locatário',
    tenant_region: 'Região de hospedagem',
    tenant_region_tip:
      'Seus recursos do locatário estão hospedados na região {{region}}. <a>Veja mais</a>',
    environment_tag_development: 'Desenvolvimento',
    environment_tag_production: 'Produção',
    tenant_type: 'Tipo de locatário',
    development_description:
      'Apenas para testes e não deve ser usado em produção. Nenhuma assinatura é necessária. Possui todos os recursos profissionais, mas com limitações como um banner de entrada. <a>Veja mais</a>',
    production_description:
      'Destinado a aplicativos usados por usuários finais e que podem exigir uma assinatura paga. <a>Veja mais</a>',
    tenant_info_saved: 'As informações do locatário foram salvas com sucesso.',
  },
  full_env_tag: {
    development: 'Desenvolvimento',
    production: 'Produção',
  },
  deletion_card: {
    title: 'EXCLUIR',
    tenant_deletion: 'Excluir locatário',
    tenant_deletion_description:
      'A exclusão do locatário resultará na remoção permanente de todos os dados de usuário e configuração associados. Por favor, prossiga com cuidado.',
    tenant_deletion_button: 'Excluir locatário',
  },
  leave_tenant_card: {
    title: 'SAIR',
    leave_tenant: 'Sair do locatário',
    leave_tenant_description:
      'Quaisquer recursos no locatário permanecerão, mas você não terá mais acesso a este locatário.',
    last_admin_note:
      'Para sair deste locatário, certifique-se de que pelo menos mais um membro tenha a função de Administrador.',
  },
  create_modal: {
    title: 'Criar inquilino',
    subtitle:
      'Crie um novo locatário que tenha recursos e usuários isolados. As regiões de dados hospedados e os tipos de locatário não podem ser modificados após a criação.',
    tenant_usage_purpose: 'Para que você deseja usar este locatário?',
    development_description:
      'Apenas para testes e não deve ser usado em produção. Nenhuma assinatura é necessária.',
    development_hint:
      'Possui todos os recursos profissionais, mas com limitações como um banner de entrada.',
    production_description: 'Para uso por usuários finais e pode exigir uma assinatura paga.',
    available_plan: 'Plano disponível:',
    create_button: 'Criar inquilino',
    tenant_name_placeholder: 'Meu inquilino',
  },
  dev_tenant_migration: {
    title:
      'Agora você pode experimentar nossos recursos Pro gratuitamente criando um novo “locatário de desenvolvimento”!',
    affect_title: 'Como isso afeta você?',
    hint_1:
      'Estamos substituindo as antigas <strong>etiquetas de ambiente</strong> por dois novos tipos de locatário: <strong>“Desenvolvimento”</strong> e <strong>“Produção”</strong>.',
    hint_2:
      'Para garantir uma transição contínua e funcionalidade ininterrupta, todos os locatários criados anteriormente serão elevados ao tipo de locatário <strong>Produção</strong> juntamente com sua assinatura anterior.',
    hint_3: 'Não se preocupe, todas as suas outras configurações permanecerão as mesmas.',
    about_tenant_type: 'Sobre o tipo de locatário',
  },
  delete_modal: {
    title: 'Excluir locatário',
    description_line1:
      'Tem certeza de que deseja excluir o seu locatário "<span>{{name}}</span>" com a etiqueta de sufixo de ambiente "<span>{{tag}}</span>"? Esta ação não pode ser desfeita e resultará na exclusão permanente de todos os seus dados e informações do locatário.',
    description_line2:
      'Antes de excluir o locatário, talvez possamos ajudar você. <span><a>Entre em contato conosco por e-mail</a></span>',
    description_line3:
      'Se deseja prosseguir, digite o nome do locatário "<span>{{name}}</span>" para confirmar.',
    delete_button: 'Excluir permanentemente',
    cannot_delete_title: 'Não é possível excluir este inquilino',
    cannot_delete_description:
      'Desculpe, no momento você não pode excluir este locatário. Certifique-se de que está no Plano Gratuito e tenha pago todas as faturas pendentes.',
  },
  leave_tenant_modal: {
    description: 'Tem certeza de que deseja sair deste locatário?',
    leave_button: 'Sair',
  },
  tenant_landing_page: {
    title: 'Você ainda não criou um inquilino',
    description:
      'Para começar a configurar seu projeto com o Logto, crie um novo inquilino. Se você precisar fazer logout ou excluir sua conta, basta clicar no botão do avatar no canto superior direito.',
    create_tenant_button: 'Criar inquilino',
  },
  status: {
    mau_exceeded: 'MAU Excedido',
    suspended: 'Suspenso',
    overdue: 'Atrasado',
  },
  tenant_suspended_page: {
    title: 'Locatário suspenso. Entre em contato para restaurar o acesso.',
    description_1:
      'Lamentamos informar que sua conta de locatário foi temporariamente suspensa devido a uso indevido, incluindo exceder os limites de MAU, pagamentos em atraso ou outras ações não autorizadas.',
    description_2:
      'Se precisar de mais esclarecimentos, tiver alguma preocupação ou desejar restaurar a funcionalidade total e desbloquear seus locatários, entre em contato conosco imediatamente.',
  },
};

export default Object.freeze(tenants);
