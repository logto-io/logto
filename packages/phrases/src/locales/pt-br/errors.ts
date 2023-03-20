const errors = {
  request: {
    invalid_input: 'Entrada inválida. {{details}}',
    general: 'Ocorreu um erro no pedido.',
  },
  auth: {
    authorization_header_missing: 'O cabeçalho de autorização está ausente.',
    authorization_token_type_not_supported: 'O tipo de autorização não é suportado.',
    unauthorized: 'Não autorizado. Verifique as credenciais e seu escopo.',
    forbidden: 'Proibido. Verifique suas funções e permissões de usuário.',
    expected_role_not_found:
      'Regra esperada não encontrada. Verifique suas regras e permissões de usuário.',
    jwt_sub_missing: '`sub` ausente no JWT.',
    require_re_authentication: 'A reautenticação é necessária para executar uma ação protegida.',
  },
  guard: {
    invalid_input: 'A solicitação {{type}} é inválida.',
    invalid_pagination: 'O valor de paginação da solicitação é inválido.',
    can_not_get_tenant_id: 'Não foi possível obter o ID do inquilino na solicitação.',
    file_size_exceeded: 'Tamanho do arquivo excedido.',
    mime_type_not_allowed: 'Tipo MIME não permitido.',
  },
  oidc: {
    aborted: 'A interação abortada pelo end-user',
    invalid_scope: 'Escopo {{scope}} não é suportado.',
    invalid_scope_plural: 'Escopo {{scopes}} não são suportados.',
    invalid_token: 'Token inválido.',
    invalid_client_metadata: 'Metadados de cliente inválidos.',
    insufficient_scope: 'Escopo solicitado ausente {{scopes}} do token de acesso.',
    invalid_request: 'A solicitação é inválida.',
    invalid_grant: 'A solicitação de concessão é inválida.',
    invalid_redirect_uri:
      '`redirect_uri` não correspondeu a nenhum `redirect_uris` registrado do cliente.',
    access_denied: 'Acesso negado.',
    invalid_target: 'Indicador de recurso inválido.',
    unsupported_grant_type: '`grant_type` não suportado.',
    unsupported_response_mode: '`response_mode` não suportado.',
    unsupported_response_type: '`response_type` não suportado.',
    provider_error: 'Erro interno OIDC: {{message}}.',
  },
  user: {
    username_already_in_use: 'Este nome de usuário já está em uso.',
    email_already_in_use: 'Este e-mail está associado a uma conta existente.',
    phone_already_in_use: 'Este número de telefone está associado a uma conta existente.',
    invalid_email: 'Endereço de e-mail inválido.',
    invalid_phone: 'Número de telefone inválido.',
    email_not_exist: 'O endereço de e-mail ainda não foi registrado.',
    phone_not_exist: 'O número de telefone ainda não foi registrado.',
    identity_not_exist: 'A conta social ainda não foi registrada.',
    identity_already_in_use: 'A conta social foi associada a uma conta existente.',
    social_account_exists_in_profile: 'A conta social já está associada ao seu perfil.',
    cannot_delete_self: 'Você não pode excluir a si mesmo.',
    sign_up_method_not_enabled: 'Este método de inscrição não está ativado',
    sign_in_method_not_enabled: 'Este método de login não está habilitado.',
    same_password: 'A nova senha não pode ser igual à senha antiga.',
    password_required_in_profile: 'Você precisa definir uma senha antes de entrar.',
    new_password_required_in_profile: 'Você precisa definir uma nova senha.',
    password_exists_in_profile: 'A senha já existe em seu perfil.',
    username_required_in_profile: 'Você precisa definir um nome de usuário antes de entrar.',
    username_exists_in_profile: 'O nome de usuário já existe em seu perfil.',
    email_required_in_profile: 'Você precisa adicionar um endereço de e-mail antes de fazer login.',
    email_exists_in_profile: 'Seu perfil já foi associado a um endereço de e-mail.',
    phone_required_in_profile: 'Você precisa adicionar um número de telefone antes de fazer login.',
    phone_exists_in_profile: 'Seu perfil já foi associado a um número de telefone.',
    email_or_phone_required_in_profile:
      'Você precisa adicionar um endereço de e-mail ou número de telefone antes de fazer login.',
    suspended: 'Esta conta está suspensa.',
    user_not_exist: 'O usuário com {{ identifier }} não existe',
    missing_profile: 'Você precisa fornecer informações adicionais antes de fazer login.',
    role_exists: 'O id da função {{roleId}} já foi adicionado a este usuário',
  },
  password: {
    unsupported_encryption_method: 'O método de criptografia {{name}} não é suportado.',
    pepper_not_found: 'Password pepper não encontrada. Por favor, verifique seus envs principais.',
  },
  session: {
    not_found: 'Sessão não encontrada. Volte e faça login novamente.',
    invalid_credentials: 'Credenciais inválidas. Verifique sua entrada.',
    invalid_sign_in_method: 'O método de login atual não está disponível.',
    invalid_connector_id:
      'Não foi possível encontrar o conector disponível com id {{connectorId}}.',
    insufficient_info: 'Informações de login insuficientes.',
    connector_id_mismatch: 'O connectorId é incompatível com o registro da sessão.',
    connector_session_not_found: 'Sessão do conector não encontrada. Volte e faça login novamente.',
    verification_session_not_found:
      'A verificação não foi bem-sucedida. Reinicie o fluxo de verificação e tente novamente.',
    verification_expired:
      'A conexão expirou. Verifique novamente para garantir a segurança da sua conta.',
    unauthorized: 'Faça login primeiro.',
    unsupported_prompt_name: 'Prompt name incompatível.',
    forgot_password_not_enabled: 'Esqueceu a senha não está ativado.',
    verification_failed:
      'A verificação não foi bem-sucedida. Reinicie o fluxo de verificação e tente novamente.',
    connector_validation_session_not_found:
      'A sessão de validação do token do conector não foi encontrada.',
    identifier_not_found:
      'Identificador de usuário não encontrado. Por favor, volte e faça o login novamente.',
    interaction_not_found:
      'Sessão de interação não encontrada. Por favor, volte e inicie a sessão novamente.',
  },
  connector: {
    general: 'Ocorreu um erro no conector: {{errorDescription}}',
    not_found: 'Não foi possível encontrar nenhum conector disponível para o tipo: {{type}}.',
    not_enabled: 'O conector não está ativado.',
    invalid_metadata: 'Os metadados do conector são inválidos.',
    invalid_config_guard: 'A proteção de configuração do conector é inválida.',
    unexpected_type: 'O tipo do conector é inesperado.',
    invalid_request_parameters: 'A solicitação está com parâmetro(s) de entrada incorreto(s).',
    insufficient_request_parameters: 'A solicitação pode perder alguns parâmetros de entrada.',
    invalid_config: 'A configuração do conector é inválida.',
    invalid_response: 'A resposta do conector é inválida.',
    template_not_found: 'Não foi possível encontrar o modelo correto na configuração do conector.',
    not_implemented: '{{method}}: ainda não foi implementado.',
    social_invalid_access_token: 'O token de acesso do conector é inválido.',
    invalid_auth_code: 'O código de autenticação do conector é inválido.',
    social_invalid_id_token: 'O token de id do conector é inválido.',
    authorization_failed: 'O processo de autorização do usuário não foi bem-sucedido.',
    social_auth_code_invalid:
      'Não foi possível obter o token de acesso, verifique o código de autorização.',
    more_than_one_sms: 'O número de conectores SMS é maior que 1.',
    more_than_one_email: 'O número de conectores de e-mail é maior que 1.',
    more_than_one_connector_factory:
      'Foram encontradas várias fábricas de conectores (com os ids {{connectorIds}}), você pode desinstalar as desnecessárias.',
    db_connector_type_mismatch: 'Existe um conector no banco de dados que não corresponde ao tipo.',
    not_found_with_connector_id:
      'Não é possível encontrar o conector com o ID de conector padrão fornecido.',
    multiple_instances_not_supported:
      'Não é possível criar várias instâncias com conector padrão escolhido.',
    invalid_type_for_syncing_profile:
      'Você só pode sincronizar o perfil do usuário com conectores sociais.',
    can_not_modify_target: 'O destino do conector não pode ser modificado.',
    should_specify_target: "Você deve especificar o 'destino'.",
    multiple_target_with_same_platform:
      'Você não pode ter vários conectores sociais com o mesmo destino e plataforma.',
    cannot_overwrite_metadata_for_non_standard_connector:
      "Esta 'metadata' do conector não pode ser sobrescrita.",
  },
  verification_code: {
    phone_email_empty: 'Tanto o telefone quanto o e-mail estão vazios.',
    not_found:
      'Código de verificação não encontrado. Por favor, envie um código de verificação primeiro.',
    phone_mismatch: 'Telefone não corresponde. Por favor, solicite um novo código de verificação.',
    email_mismatch: 'E-mail não corresponde. Por favor, solicite um novo código de verificação.',
    code_mismatch: 'Código de verificação inválido.',
    expired: 'O código de verificação expirou. Por favor, solicite um novo código de verificação.',
    exceed_max_try:
      'Excedido o limite de tentativas de código de verificação. Por favor, solicite um novo código de verificação.',
  },
  sign_in_experiences: {
    empty_content_url_of_terms_of_use:
      'URL de conteúdo "Termos de uso" vazia. Adicione o URL do conteúdo se "Termos de uso" estiver ativado.',
    empty_social_connectors:
      'Conectores sociais vazios. Adicione conectores sociais ativados quando o método de login social estiver ativado.',
    enabled_connector_not_found: 'Conector {{type}} ativado não encontrado.',
    not_one_and_only_one_primary_sign_in_method:
      'Deve haver um método de login principal. Verifique sua entrada.',
    username_requires_password:
      'Deve permitir definir uma senha para o identificador de inscrição do nome de usuário.',
    passwordless_requires_verify:
      'Deve ativar a verificação do identificador de inscrição de e-mail/telefone.',
    miss_sign_up_identifier_in_sign_in:
      'Os métodos de login devem conter o identificador de inscrição.',
    password_sign_in_must_be_enabled:
      'O login com senha deve ser ativado quando definir uma senha é necessária na inscrição.',
    code_sign_in_must_be_enabled:
      'O login do código de verificação deve ser ativado quando definir uma senha não é necessária na inscrição.',
    unsupported_default_language: 'Este idioma - {{language}} não é suportado no momento.',
    at_least_one_authentication_factor: 'Você deve selecionar pelo menos um fator de autenticação.',
  },
  localization: {
    cannot_delete_default_language:
      '{{languageTag}} está definido como seu idioma padrão e não pode ser excluído.',
    invalid_translation_structure:
      'Esquemas de dados inválidos. Verifique sua entrada e tente novamente.',
  },
  swagger: {
    invalid_zod_type: 'Zod type inválido. Verifique a configuração do protetor de rota.',
    not_supported_zod_type_for_params:
      'Zod type não suportado para os parâmetros. Verifique a configuração do protetor de rota.',
  },
  entity: {
    create_failed: 'Falha ao criar {{name}}.',
    not_exists: 'O {{name}} não existe.',
    not_exists_with_id: 'O {{name}} com ID `{{id}}` não existe.',
    not_found: 'O recurso não existe.',
  },
  log: {
    invalid_type: 'O tipo de registro é inválido.',
  },
  role: {
    name_in_use: 'Este nome de papel {{name}} já está em uso',
    scope_exists: 'O id de escopo {{scopeId}} já foi adicionado a este papel',
    user_exists: 'O id de usuário {{userId}} já foi adicionado a este papel',
    default_role_missing:
      'Alguns dos nomes de função padrão não existem no banco de dados, certifique-se de criar funções primeiro',
    internal_role_violation:
      'Você pode estar tentando atualizar ou excluir uma função interna que é proibida pelo Logto. Se você estiver criando uma nova função, tente outro nome que não comece com "#internal:".',
  },
  scope: {
    name_exists: 'O nome do escopo {{name}} já está em uso',
    name_with_space: 'O nome do escopo não pode conter espaços.',
  },
  storage: {
    not_configured: 'O provedor de armazenamento não está configurado.',
    missing_parameter: 'Parâmetro {{parameter}} ausente para o provedor de armazenamento.',
    upload_error: 'Falha ao fazer upload do arquivo para o provedor de armazenamento.',
  },
};

export default errors;
