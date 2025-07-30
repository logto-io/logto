const user_identity_details = {
  social_identity_page_title: 'Detalhes de identidade social',
  back_to_user_details: 'Voltar para detalhes do usuário',
  delete_identity: `Remover conexão de identidade`,
  social_account: {
    title: 'Conta social',
    description:
      'Veja os dados do usuário e as informações do perfil sincronizadas da conta vinculada {{connectorName}}.',
    provider_name: 'Nome do provedor de identidade social',
    identity_id: 'ID de identidade social',
    user_profile: 'Perfil do usuário sincronizado do provedor de identidade social',
  },
  sso_account: {
    title: 'Conta de SSO empresarial',
    description:
      'Veja os dados do usuário e as informações do perfil sincronizadas da conta vinculada {{connectorName}}.',
    provider_name: 'Nome do provedor de identidade de SSO empresarial',
    identity_id: 'ID de identidade de SSO empresarial',
    user_profile: 'Perfil do usuário sincronizado do provedor de identidade de SSO empresarial',
  },
  token_storage: {
    title: 'Token de acesso',
    description:
      'Armazene tokens de acesso e atualização de {{connectorName}} no Cofre Secreto. Permite chamadas de API automatizadas sem o consentimento repetido do usuário.',
  },
  access_token: {
    title: 'Token de acesso',
    description_active:
      'O token de acesso está ativo e armazenado com segurança no Cofre Secreto. Seu produto pode usá-lo para acessar as APIs de {{connectorName}}.',
    description_inactive:
      'Este token de acesso está inativo (por exemplo, revogado). Os usuários devem reautorizar o acesso para restaurar a funcionalidade.',
    description_expired:
      'Este token de acesso expirou. A renovação ocorre automaticamente na próxima solicitação de API usando o token de atualização. Se o token de atualização não estiver disponível, é necessário reautenticar o usuário.',
  },
  refresh_token: {
    available:
      'Token de atualização disponível. Se o token de acesso expirar, ele será automaticamente renovado usando o token de atualização.',
    not_available:
      'Token de atualização não disponível. Após o token de acesso expirar, os usuários devem reautenticar para obter novos tokens.',
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
      'Tem certeza de que deseja excluir os tokens? O Cofre Secreto Logto removerá os tokens de acesso e atualização armazenados de {{connectorName}}. Este usuário deve reautorizar para restaurar o acesso às APIs de {{connectorName}}.',
  },
  token_storage_disabled: {
    title: 'Armazenamento de tokens desativado para este conector',
    description:
      'Os usuários atualmente podem usar {{connectorName}} apenas para efetuar login, vincular contas ou sincronizar perfis durante cada fluxo de consentimento. Para acessar as APIs de {{connectorName}} e realizar ações em nome dos usuários, habilite o armazenamento de tokens em',
  },
};

export default Object.freeze(user_identity_details);
