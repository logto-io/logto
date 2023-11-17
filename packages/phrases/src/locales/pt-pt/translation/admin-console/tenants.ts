const tenants = {
  title: 'Definições',
  description: 'Gerir eficientemente as configurações do inquilino e personalizar o seu domínio.',
  tabs: {
    settings: 'Definições',
    domains: 'Domínios',
    subscription: 'Plano e faturação',
    billing_history: 'Histórico de faturação',
  },
  settings: {
    title: 'DEFINIÇÕES',
    /** UNTRANSLATED */
    description: 'Set the tenant name and view your data hosted region and tenant type.',
    tenant_id: 'ID do Inquilino',
    tenant_name: 'Nome do Inquilino',
    tenant_region: 'Região de hospedagem',
    tenant_region_tip:
      'Os recursos do seu inquilino são hospedados na região {{region}}. <a>Learn more</a>',
    environment_tag: 'Tag de Ambiente',
    environment_tag_description:
      'As etiquetas não alteram o serviço. Simplesmente guiam-no para diferenciar vários ambientes.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    /** UNTRANSLATED */
    tenant_type: 'Tenant type',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required. It has all the pro features but has limitations like a sign-in banner. <a>Learn more</a>",
    /** UNTRANSLATED */
    production_description:
      'Intended for apps that are being used by end-users and may require a paid subscription. <a>Learn more</a>',
    tenant_info_saved: 'A informação do arrendatário foi guardada com sucesso.',
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
  create_modal: {
    title: 'Criar inquilino',
    subtitle_deprecated: 'Crie um novo inquilino para separar recursos e utilizadores.',
    subtitle:
      'Crie um novo locatário que tenha recursos e utilizadores isolados. As regiões de dados hospedados e os tipos de locatário não podem ser modificados após a criação.',
    tenant_usage_purpose: 'Para que pretende utilizar este inquilino?',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required.",
    /** UNTRANSLATED */
    development_hint: 'It has all the pro features but has limitations like a sign-in banner.',
    /** UNTRANSLATED */
    production_description: 'For use by end-users and may require a paid subscription.',
    available_plan: 'Plano disponível:',
    create_button: 'Criar inquilino',
    tenant_name_placeholder: 'Meu inquilino',
  },
  dev_tenant_migration: {
    /** UNTRANSLATED */
    title: 'You can now try our Pro features for free by creating a new "Development tenant"!',
    /** UNTRANSLATED */
    affect_title: 'How does this affect you?',
    /** UNTRANSLATED */
    hint_1:
      'We are replacing the old <strong>environment tags</strong> with two new tenant types: <strong>“Development”</strong> and <strong>“Production”</strong>.',
    /** UNTRANSLATED */
    hint_2:
      'To ensure a seamless transition and uninterrupted functionality, all early-created tenants will be elevated to the <strong>Production</strong> tenant type along with your previous subscription.',
    /** UNTRANSLATED */
    hint_3: "Don't worry, all your other settings will remain the same.",
    /** UNTRANSLATED */
    about_tenant_type: 'About tenant type',
  },
  dev_tenant_notification: {
    /** UNTRANSLATED */
    title: 'You can now access <a>all features of Logto Pro</a> in your development tenant!',
    /** UNTRANSLATED */
    description: "It's completely free, with no trial period – forever!",
  },
  delete_modal: {
    title: 'Eliminar inquilino',
    description_line1:
      'Tem a certeza de que pretende eliminar o seu inquilino "<span>{{name}}</span>" com a etiqueta de ambiente de sufixo "<span>{{tag}}</span>"? Esta ação não pode ser desfeita e resultará na eliminação permanente de todos os seus dados e informações da conta.',
    description_line2:
      'Antes de eliminar a conta, podemos ajudá-lo. <span><a>Contacte-nos por email</a></span>',
    description_line3:
      'Se desejar continuar, introduza o nome do inquilino "<span>{{name}}</span>" para confirmar.',
    delete_button: 'Eliminar permanentemente',
    cannot_delete_title: 'Não é possível apagar este inquilino',
    cannot_delete_description:
      'Desculpe, não é possível apagar este inquilino neste momento. Certifique-se de estar no Plano Gratuito e de ter pago todas as faturas em atraso.',
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
  signing_keys: {
    title: 'CHAVES DE ASSINATURA',
    description: 'Gerir de forma segura as chaves de assinatura no seu inquilino.',
    type: {
      private_key: 'Chaves privadas OIDC',
      cookie_key: 'Chaves de cookies OIDC',
    },
    private_keys_in_use: 'Chaves privadas em uso',
    cookie_keys_in_use: 'Chaves de cookies em uso',
    rotate_private_keys: 'Rodar chaves privadas',
    rotate_cookie_keys: 'Rodar chaves de cookies',
    rotate_private_keys_description:
      'Esta ação criará uma nova chave privada de assinatura, rodará a chave atual e removerá a chave anterior. Os seus tokens JWT assinados com a chave atual permanecerão válidos até à eliminação ou outra rodada de rotação.',
    rotate_cookie_keys_description:
      'Esta ação criará uma nova chave de cookie, rodará a chave atual e removerá a chave anterior. Os seus cookies com a chave atual permanecerão válidos até à eliminação ou outra rodada de rotação.',
    select_private_key_algorithm: 'Selecionar o algoritmo de assinatura para a nova chave privada',
    rotate_button: 'Rodar',
    table_column: {
      id: 'ID',
      status: 'Estado',
      algorithm: 'Algoritmo de assinatura da chave',
    },
    status: {
      current: 'Atual',
      previous: 'Anterior',
    },
    reminder: {
      rotate_private_key:
        'Tem a certeza de que pretende rodar as <strong>chaves privadas OIDC</strong>? Os novos tokens JWT emitidos serão assinados pela nova chave. Os tokens JWT existentes permanecem válidos até rodar novamente.',
      rotate_cookie_key:
        'Tem a certeza de que pretende rodar as <strong>chaves de cookies OIDC</strong>? Os novos cookies gerados em sessões de login serão assinados pela nova chave de cookie. Os cookies existentes permanecem válidos até rodar novamente.',
      delete_private_key:
        'Tem a certeza de que pretende eliminar a <strong>chave privada OIDC</strong>? Os tokens JWT existentes assinados com esta chave de assinatura privada deixarão de ser válidos.',
      delete_cookie_key:
        'Tem a certeza de que pretende eliminar a <strong>chave de cookie OIDC</strong>? As sessões de login antigas com cookies assinados com esta chave de cookie deixarão de ser válidas. É necessária uma nova autenticação para estes utilizadores.',
    },
    messages: {
      rotate_key_success: 'Chaves de assinatura rodadas com sucesso.',
      delete_key_success: 'Chave eliminada com sucesso.',
    },
  },
};

export default Object.freeze(tenants);
