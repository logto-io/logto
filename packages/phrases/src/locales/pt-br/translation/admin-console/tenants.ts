const tenants = {
  title: 'Configurações',
  description: 'Gerencie eficientemente as configurações do locatário e personalize seu domínio.',
  tabs: {
    settings: 'Configurações',
    domains: 'Domínios',
    subscription: 'Plano e faturamento',
    billing_history: 'Histórico de faturamento',
  },
  settings: {
    title: 'CONFIGURAÇÕES',
    description:
      'Defina o nome do locatário e veja a região de hospedagem e a etiqueta do ambiente.',
    tenant_id: 'ID do Locatário',
    tenant_name: 'Nome do Locatário',
    tenant_region: 'Região de hospedagem',
    tenant_region_tip:
      'Seus recursos do locatário estão hospedados na região {{region}}. <a>Learn more</a>',
    environment_tag: 'Tag do Ambiente',
    environment_tag_description:
      'As tags não alteram o serviço. Elas apenas ajudam a diferenciar vários ambientes.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Homol',
    environment_tag_production: 'Prod',
    development_description:
      "O ambiente de desenvolvimento é usado principalmente para testes e inclui todos os recursos profissionais, mas possui marcas d'água na experiência de login. <a>Learn more</a>",
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
  create_modal: {
    title: 'Criar inquilino',
    subtitle: 'Crie um novo inquilino para separar recursos e usuários.',
    subtitle_with_region:
      'Crie um novo locatário para separar recursos e usuários. Região e etiquetas de ambiente não podem ser modificadas após a criação.',
    tenant_usage_purpose: 'Para que você deseja usar este locatário?',
    development_description:
      'O ambiente de desenvolvimento é usado principalmente para testes e não deve ser usado em um ambiente de produção.',
    development_hint:
      'O ambiente de desenvolvimento é usado principalmente para testes e não deve ser usado em um ambiente de produção.',
    production_description:
      'Produção é onde o software ao vivo é usado pelos usuários finais e pode exigir uma assinatura paga.',
    available_plan: 'Plano disponível:',
    create_button: 'Criar inquilino',
    tenant_name_placeholder: 'Meu inquilino',
  },
  notification: {
    allow_pro_features_title:
      'Agora você pode acessar <span>todos os recursos do Logto Pro</span> em seu locatário de desenvolvimento!',
    allow_pro_features_description: 'É completamente gratuito, sem período de teste - para sempre!',
    explore_all_features: 'Explore todos os recursos',
    impact_title: 'Isso tem algum impacto em mim?',
    staging_env_hint:
      'Sua etiqueta de locatário foi atualizada de "<strong>Homologação</strong>" para "<strong>Produção</strong>", mas essa mudança não afetará sua configuração atual.',
    paid_tenant_hint_1:
      'Ao assinar o plano Logto Hobby, sua etiqueta de locatário "<strong>Desenvolvimento</strong>" anterior mudará para "<strong>Produção</strong>", e isso não afetará sua configuração existente.',
    paid_tenant_hint_2:
      'Se você ainda está em fase de desenvolvimento, pode criar um novo locatário de desenvolvimento para acessar mais recursos profissionais.',
    paid_tenant_hint_3:
      'Se você está em estágio de produção, ou em um ambiente de produção, ainda precisará assinar um plano específico, então não há nada que você precise fazer neste momento.',
    paid_tenant_hint_4:
      'Não hesite em nos contactar se precisar de ajuda! Obrigado por escolher o Logto!',
  },
  delete_modal: {
    title: 'Excluir locatário',
    description_line1:
      'Tem certeza que deseja excluir seu locatário "<span>{{name}}</span>" com a etiqueta de sufixo de ambiente "<span>{{tag}}</span>"? Esta ação não pode ser desfeita e resultará na exclusão permanente de todos os seus dados e informações de conta.',
    description_line2:
      'Antes de excluir a conta, podemos ajudá-lo. <span><a>Entre em contato conosco por e-mail</a></span>',
    description_line3:
      'Se você deseja continuar, digite o nome do locatário "<span>{{name}}</span>" para confirmar.',
    delete_button: 'Excluir permanentemente',
    cannot_delete_title: 'Não é possível excluir este inquilino',
    cannot_delete_description:
      'Desculpe, você não pode excluir este locatário no momento. Certifique-se de estar no Plano Gratuito e ter pago todas as faturas pendentes.',
  },
  tenant_landing_page: {
    title: 'Você ainda não criou um inquilino',
    description:
      'Para começar a configurar seu projeto com o Logto, crie um novo inquilino. Se você precisar fazer logout ou excluir sua conta, basta clicar no botão de avatar no canto superior direito.',
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
      'Lamentamos profundamente informar que sua conta de locatário foi temporariamente suspensa devido a uso impróprio, incluindo exceder os limites de MAU, pagamentos atrasados ou outras ações não autorizadas.',
    description_2:
      'Se você precisa de mais esclarecimentos, tem alguma preocupação ou deseja restaurar a funcionalidade total e desbloquear seus locatários, não hesite em entrar em contato conosco imediatamente.',
  },
  signing_keys: {
    title: 'CHAVES DE ASSINATURA',
    description: 'Gerencie de forma segura as chaves de assinatura em seu locatário.',
    type: {
      private_key: 'Chaves privadas do OIDC',
      cookie_key: 'Chaves de cookie do OIDC',
    },
    private_keys_in_use: 'Chaves privadas em uso',
    cookie_keys_in_use: 'Chaves de cookie em uso',
    rotate_private_keys: 'Girar chaves privadas',
    rotate_cookie_keys: 'Girar chaves de cookie',
    rotate_private_keys_description:
      'Esta ação criará uma nova chave privada de assinatura, girará a chave atual e removerá sua chave anterior. Seus tokens JWT assinados com a chave atual permanecerão válidos até a exclusão ou outra rodada de rotação.',
    rotate_cookie_keys_description:
      'Esta ação criará uma nova chave de cookie, girará a chave atual e removerá sua chave anterior. Seus cookies com a chave atual permanecerão válidos até a exclusão ou outra rodada de rotação.',
    select_private_key_algorithm: 'Selecione o algoritmo de assinatura para a nova chave privada',
    rotate_button: 'Girar',
    table_column: {
      id: 'ID',
      status: 'Status',
      algorithm: 'Algoritmo de assinatura',
    },
    status: {
      current: 'Atual',
      previous: 'Anterior',
    },
    reminder: {
      rotate_private_key:
        'Tem certeza de que deseja girar as <strong>chaves privadas do OIDC</strong>? Os novos tokens JWT emitidos serão assinados pela nova chave. Os tokens JWT existentes permanecem válidos até você girar novamente.',
      rotate_cookie_key:
        'Tem certeza de que deseja girar as <strong>chaves de cookie do OIDC</strong>? Novos cookies gerados em sessões de login serão assinados pela nova chave de cookie. Os cookies existentes permanecem válidos até você girar novamente.',
      delete_private_key:
        'Tem certeza de que deseja excluir a <strong>chave privada do OIDC</strong>? Tokens JWT existentes assinados com esta chave privada de assinatura não serão mais válidos.',
      delete_cookie_key:
        'Tem certeza de que deseja excluir a <strong>chave de cookie do OIDC</strong>? As sessões de login mais antigas com cookies assinados com esta chave de cookie não serão mais válidas. Será necessária uma nova autenticação para esses usuários.',
    },
    messages: {
      rotate_key_success: 'Chaves de assinatura giradas com sucesso.',
      delete_key_success: 'Chave excluída com sucesso.',
    },
  },
};

export default Object.freeze(tenants);
