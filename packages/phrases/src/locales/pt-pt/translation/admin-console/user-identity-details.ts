const user_identity_details = {
  social_identity_page_title: 'Detalhes da identidade social',
  back_to_user_details: 'Voltar aos detalhes do usuário',
  delete_identity: `Remover conexão de identidade`,
  social_account: {
    title: 'Conta social',
    description:
      'Ver dados e informações de perfil do usuário sincronizados a partir da conta {{connectorName}} vinculada.',
    provider_name: 'Nome do provedor de identidade social',
    identity_id: 'ID de identidade social',
    user_profile: 'Perfil do usuário sincronizado do provedor de identidade social',
  },
  sso_account: {
    title: 'Conta de SSO empresarial',
    description:
      'Ver dados e informações de perfil do usuário sincronizados a partir da conta {{connectorName}} vinculada.',
    provider_name: 'Nome do provedor de identidade SSO empresarial',
    identity_id: 'ID de identidade SSO empresarial',
    user_profile: 'Perfil do usuário sincronizado do provedor de identidade SSO empresarial',
  },
  token_storage: {
    title: 'Token de acesso',
    description:
      'Armazenar tokens de acesso e atualização do {{connectorName}} no Cofre Secreto. Permite chamadas de API automatizadas sem consentimento repetido do usuário.',
  },
  access_token: {
    title: 'Token de acesso',
    description_active:
      'O token de acesso está ativo e armazenado com segurança no Cofre Secreto. O seu produto pode usá-lo para acessar as APIs do {{connectorName}}.',
    description_inactive:
      'Este token de acesso está inativo (por exemplo, revogado). Os usuários devem reautorizar o acesso para restaurar a funcionalidade.',
    description_expired:
      'Este token de acesso expirou. A renovação ocorre automaticamente na próxima solicitação de API usando o token de atualização. Se o token de atualização não estiver disponível, é necessário reautenticação do usuário.',
  },
  refresh_token: {
    available:
      'O token de atualização está disponível. Se o token de acesso expirar, ele será automaticamente atualizado usando o token de atualização.',
    not_available:
      'O token de atualização não está disponível. Após o token de acesso expirar, os usuários devem reautenticar para obter novos tokens.',
  },
  token_status: 'Status do token',
  created_at: 'Criado em',
  updated_at: 'Atualizado em',
  expires_at: 'Expira em',
  scopes: 'Escopos',
  delete_tokens: {
    title: 'Excluir tokens',
    description:
      'Excluir os tokens armazenados. Os usuários devem reautorizar o acesso para restaurar a funcionalidade.',
    confirmation_message:
      'Tem certeza de que deseja excluir os tokens? O Cofre Secreto Logto removerá os tokens de acesso e atualização do {{connectorName}} armazenados. Este usuário deve reautorizar para restaurar o acesso à API do {{connectorName}}.',
  },
  token_storage_disabled: {
    title: 'Armazenamento de tokens está desativado para este conector',
    description:
      'Os usuários atualmente só podem usar o {{connectorName}} para fazer login, vincular contas ou sincronizar perfis durante cada fluxo de consentimento. Para acessar as APIs do {{connectorName}} e realizar ações em nome dos usuários, ative o armazenamento de tokens em',
  },
};

export default Object.freeze(user_identity_details);
