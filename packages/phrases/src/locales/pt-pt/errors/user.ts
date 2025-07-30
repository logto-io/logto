const user = {
  username_already_in_use: 'Este nome de utilizador já está em uso.',
  email_already_in_use: 'Este email já está associado a uma conta existente.',
  phone_already_in_use: 'Este número de telefone já está associado a uma conta existente.',
  invalid_email: 'Endereço de email inválido.',
  invalid_phone: 'Número de telefone inválido.',
  email_not_exist: 'O endereço de email ainda não foi registado.',
  phone_not_exist: 'O número de telefone ainda não foi registado.',
  identity_not_exist: 'A conta social ainda não foi registada.',
  identity_already_in_use: 'A conta social foi registada.',
  social_account_exists_in_profile: 'A conta social já foi associada a este perfil.',
  cannot_delete_self: 'Não se pode remover a si mesmo.',
  sign_up_method_not_enabled: 'Este método de registo não está ativo.',
  sign_in_method_not_enabled: 'Este método de início de sessão não está ativo.',
  same_password: 'A nova palavra-passe não pode ser igual à antiga.',
  password_required_in_profile: 'Precisa de definir uma palavra-passe antes de iniciar sessão.',
  new_password_required_in_profile: 'Precisa de definir uma nova palavra-passe.',
  password_exists_in_profile: 'A palavra-passe já existe no seu perfil.',
  username_required_in_profile: 'Precisa de definir um nome de utilizador antes de iniciar sessão.',
  username_exists_in_profile: 'O nome de utilizador já existe no seu perfil.',
  email_required_in_profile: 'Precisa de adicionar um endereço de email antes de iniciar sessão.',
  email_exists_in_profile: 'O seu perfil já está associado a um endereço de email.',
  phone_required_in_profile: 'Precisa de adicionar um número de telefone antes de iniciar sessão.',
  phone_exists_in_profile: 'O seu perfil já está associado a um número de telefone.',
  email_or_phone_required_in_profile:
    'Precisa de adicionar um endereço de email ou um número de telefone antes de iniciar sessão.',
  suspended: 'Esta conta está suspensa.',
  user_not_exist: 'O utilizador com {{ identifier }} não existe.',
  missing_profile: 'Precisa de fornecer informações adicionais antes de iniciar sessão.',
  role_exists: 'O id da função {{roleId}} já foi adicionado a este utilizador.',
  invalid_role_type:
    'Tipo de função inválido, não é possível atribuir uma função máquina a máquina ao utilizador.',
  missing_mfa: 'Precisas de vincular MFA adicional antes de iniciares sessão.',
  totp_already_in_use: 'TOTP já está em uso.',
  backup_code_already_in_use: 'Código de backup já está em uso.',
  password_algorithm_required: 'É necessário um algoritmo de senha.',
  password_and_digest: 'Não podes definir tanto a senha em texto simples quanto o resumo da senha.',
  personal_access_token_name_exists: 'O nome do token pessoal de acesso já existe.',
  totp_secret_invalid: 'Foi fornecido um segredo TOTP inválido.',
  wrong_backup_code_format: 'O formato do código de backup é inválido.',
  username_required:
    'Nome de utilizador é um identificador obrigatório, não podes defini-lo como nulo.',
  email_or_phone_required:
    'Endereço de email ou número de telefone é um identificador obrigatório, pelo menos um é necessário.',
  email_required:
    'Endereço de email é um identificador obrigatório, não podes defini-lo como nulo.',
  phone_required:
    'Número de telefone é um identificador obrigatório, não podes defini-lo como nulo.',
  enterprise_sso_identity_not_exists:
    'O utilizador não tem uma identidade empresarial ligada ao ID do conector SSO especificado: {{ ssoConnectorId }}.',
  identity_not_exists_in_current_user:
    'A identidade especificada não existe na conta do utilizador atual. Por favor, vincule a identidade antes de prosseguir.',
};

export default Object.freeze(user);
