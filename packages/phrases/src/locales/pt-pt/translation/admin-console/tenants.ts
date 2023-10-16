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
    tenant_id: 'ID do Inquilino',
    tenant_name: 'Nome do Inquilino',
    environment_tag: 'Tag de Ambiente',
    environment_tag_description:
      'As etiquetas não alteram o serviço. Simplesmente guiam-no para diferenciar vários ambientes.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'A informação do arrendatário foi guardada com sucesso.',
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
    subtitle: 'Crie um novo inquilino para separar recursos e utilizadores.',
    create_button: 'Criar inquilino',
    tenant_name_placeholder: 'Meu inquilino',
  },
  delete_modal: {
    title: 'Eliminar inquilino',
    description_line1:
      'Tem a certeza de que pretende eliminar o seu inquilino "<span>{{name}}</span>" com a etiqueta de sufixo de ambiente "<span>{{tag}}</span>"? Esta ação não pode ser desfeita e resultará na eliminação permanente de todos os seus dados e informações da conta.',
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
    cookie_keys_in_use: 'Cookie keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_cookie_keys: 'Rotate cookie keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This action will create a new private signing key, rotate the current key, and remove your previous key. Your JWT tokens signed with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    rotate_cookie_keys_description:
      'This action will create a new cookie key, rotate the current key, and remove your previous key. Your cookies with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for the new private key',
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
      rotate_private_key:
        'Are you sure you want to rotate the <strong>OIDC private keys</strong>? New issued JWT tokens will be signed by the new key. Existing JWT tokens stay valid until you rotate again.',
      /** UNTRANSLATED */
      rotate_cookie_key:
        'Are you sure you want to rotate the <strong>OIDC cookie keys</strong>? New cookies generated in sign-in sessions will be signed by the new cookie key. Existing cookies stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete_private_key:
        'Are you sure you want to delete the <strong>OIDC private key</strong>? Existing JWT tokens signed with this private signing key will no longer be valid.',
      /** UNTRANSLATED */
      delete_cookie_key:
        'Are you sure you want to delete the <strong>OIDC cookie key</strong>? Older sign-in sessions with cookies signed with this cookie key will no longer be valid. A re-authentication is required for these users.',
    },
  },
};

export default Object.freeze(tenants);
