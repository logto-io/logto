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
    tenant_id: 'ID do Locatário',
    tenant_name: 'Nome do Locatário',
    environment_tag: 'Tag do Ambiente',
    environment_tag_description:
      'As tags não alteram o serviço. Elas apenas ajudam a diferenciar vários ambientes.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Homol',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'As informações do locatário foram salvas com sucesso.',
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
    create_button: 'Criar inquilino',
    tenant_name_placeholder: 'Meu inquilino',
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
      'Desculpe, você não pode excluir este inquilino no momento. Certifique-se de estar no Plano Gratuito e ter pago todas as faturas pendentes.',
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
    /** UNTRANSLATED */
    title: 'SIGNING KEYS',
    /** UNTRANSLATED */
    description: 'Securely manage signing keys in your tenant.',
    type: {
      /** UNTRANSLATED */
      private_key: 'OIDC private keys',
      /** UNTRANSLATED */
      cookie_key: 'OIDC cookie keys',
    },
    /** UNTRANSLATED */
    private_keys_in_use: 'Private keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This will rotate the currently used private keys. Your {{entities}} with previous private keys will stay valid until you delete it.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for private keys',
    /** UNTRANSLATED */
    rotate_button: 'Rotate',
    table_column: {
      /** UNTRANSLATED */
      id: 'ID',
      /** UNTRANSLATED */
      status: 'Status',
      /** UNTRANSLATED */
      algorithm: 'Signing key algorithm',
    },
    status: {
      /** UNTRANSLATED */
      current: 'Current',
      /** UNTRANSLATED */
      previous: 'Previous',
    },
    reminder: {
      /** UNTRANSLATED */
      rotate:
        'Are you sure you want to rotate the <strong>{{key}}</strong>? This will require all your apps and APIs to use the new signing key. Existing {{entities}} stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete:
        'Are you sure you want to delete the <strong>{{key}}</strong>? Existing {{entities}} signed with this signing key will no longer be valid.',
    },
    signed_entity: {
      /** UNTRANSLATED */
      tokens: 'JWT tokens',
      /** UNTRANSLATED */
      cookies: 'cookies',
    },
  },
};

export default Object.freeze(tenants);
