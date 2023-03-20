const errors = {
  request: {
    invalid_input: 'Input inválido. {{details}}',
    general: 'Ocorreu um erro no pedido.',
  },
  auth: {
    authorization_header_missing: 'O cabeçalho de autorização está ausente.',
    authorization_token_type_not_supported: 'O tipo de autorização não é suportado.',
    unauthorized: 'Não autorizado. Verifique as credenciais e o scope.',
    forbidden: 'Proibido. Verifique os seus cargos e permissões.',
    expected_role_not_found: 'Role esperado não encontrado. Verifique os seus cargos e permissões.',
    jwt_sub_missing: 'Campo `sub` está ausente no JWT.',
    require_re_authentication:
      'É necessária uma nova autenticação para executar uma ação protegida.',
  },
  guard: {
    invalid_input: 'O pedido {{type}} é inválido.',
    invalid_pagination: 'O valor de paginação enviado é inválido.',
    can_not_get_tenant_id: 'Não é possível obter o ID do inquilino a partir do pedido.',
    file_size_exceeded: 'Tamanho do ficheiro excedido.',
    mime_type_not_allowed: 'Tipo MIME não permitido.',
  },
  oidc: {
    aborted: 'O utilizador final abortou a interação.',
    invalid_scope: 'Scope {{scope}} não é suportado.',
    invalid_scope_plural: 'Scope {{scopes}} não são suportados.',
    invalid_token: 'O Token fornecido é inválido.',
    invalid_client_metadata: 'Metadados de cliente inválidos fornecidos.',
    insufficient_scope: 'Token de acesso sem scope solicitado {{scopes}}.',
    invalid_request: 'Pedido inválido.',
    invalid_grant: 'Pedido Grant inválido.',
    invalid_redirect_uri:
      '`redirect_uri` não correspondeu a nenhum dos `redirect_uris` registados.',
    access_denied: 'Acesso negado.',
    invalid_target: 'Indicador de recurso inválido.',
    unsupported_grant_type: '`grant_type` solicitado não é suportado.',
    unsupported_response_mode: '`response_mode` solicitado não é suportado.',
    unsupported_response_type: '`response_type` solicitado não é suportado.',
    provider_error: 'Erro interno OIDC: {{message}}.',
  },
  user: {
    username_already_in_use: 'Este nome de usuário já está em uso.',
    email_already_in_use: 'Este email já está associado a uma conta existente.',
    phone_already_in_use: 'Este número de telefone já está associado a uma conta existente.',
    invalid_email: 'Endereço de email inválido.',
    invalid_phone: 'Número de telefone inválido.',
    email_not_exist: 'O endereço de email ainda não foi registada.',
    phone_not_exist: 'O numero do telefone ainda não foi registada.',
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
    username_required_in_profile:
      'Precisa de definir um nome de utilizador antes de iniciar sessão.',
    username_exists_in_profile: 'O nome de utilizador já existe no seu perfil.',
    email_required_in_profile: 'Precisa de adicionar um endereço de email antes de iniciar sessão.',
    email_exists_in_profile: 'O seu perfil já está associado a um endereço de email.',
    phone_required_in_profile:
      'Precisa de adicionar um número de telefone antes de iniciar sessão.',
    phone_exists_in_profile: 'O seu perfil já está associado a um número de telefone.',
    email_or_phone_required_in_profile:
      'Precisa de adicionar um endereço de email ou um número de telefone antes de iniciar sessão.',
    suspended: 'Esta conta está suspensa.',
    user_not_exist: 'O utilizador com {{ identifier }} não existe.',
    missing_profile: 'Precisa de fornecer informações adicionais antes de iniciar sessão.',
    role_exists: 'O id da função {{roleId}} já foi adicionado a este utilizador.',
  },
  password: {
    unsupported_encryption_method: 'O método de enncriptação {{name}} não é suportado.',
    pepper_not_found: 'pepper da Password não encontrada. Por favor, verifique os envs.',
  },
  session: {
    not_found: 'Sessão não encontrada. Por favor, volte e faça login novamente.',
    invalid_credentials: 'Credenciais inválidas. Por favor, verifique os dados.',
    invalid_sign_in_method: 'O método de login atual não está disponível.',
    invalid_connector_id:
      'Não foi possível encontrar um conector disponível com o id {{connectorId}}.',
    insufficient_info: 'Informações de login insuficientes.',
    connector_id_mismatch: 'O connectorId não corresponde ao registado na sessão.',
    connector_session_not_found:
      'Sessão do conector não encontrada. Por favor, volte e faça login novamente.',
    verification_session_not_found:
      'A verificação não foi bem-sucedida. Reinicie o processo de verificação e tente novamente.',
    verification_expired:
      'A conexão expirou. Verifique novamente para garantir a segurança de sua conta.',
    unauthorized: 'Faça login primeiro.',
    unsupported_prompt_name: 'Nome de prompt não suportado.',
    forgot_password_not_enabled: 'Recuperação de senha não está habilitada.',
    verification_failed:
      'A verificação não foi bem-sucedida. Reinicie o processo de verificação e tente novamente.',
    connector_validation_session_not_found:
      'A sessão do conector para validação do token não foi encontrada.',
    identifier_not_found:
      'Identificador do usuário não encontrado. Por favor, volte e faça login novamente.',
    interaction_not_found:
      'Sessão de interação não encontrada. Por favor, volte e inicie a sessão novamente.',
  },
  connector: {
    general: 'Ocorreu um erro no conector: {{errorDescription}}',
    not_found: 'Não é possível encontrar nenhum conector disponível para o tipo: {{type}}.',
    not_enabled: 'O conector não está ativo.',
    invalid_metadata: 'Os metadados do conector são inválidos.',
    invalid_config_guard: 'A configuração de proteção do conector é inválida.',
    unexpected_type: 'O tipo do conector é inesperado.',
    invalid_request_parameters: 'O pedido tem parâmetros de entrada inválidos.',
    insufficient_request_parameters: 'A solicitação pode perder alguns parâmetros de entrada.',
    invalid_config: 'A configuração do conector é inválida.',
    invalid_response: 'A resposta do conector é inválida.',
    template_not_found: 'Não foi possível encontrar o modelo correto na configuração do conector.',
    not_implemented: '{{method}}: ainda não foi implementado.',
    social_invalid_access_token: 'O token de acesso do conector é inválido.',
    invalid_auth_code: 'O código de autenticação do conector é inválido.',
    social_invalid_id_token: 'O token de ID do conector é inválido.',
    authorization_failed: 'O processo de autorização do usuário não foi bem-sucedido.',
    social_auth_code_invalid:
      'Não foi possível obter o token de acesso, verifique o código de autorização.',
    more_than_one_sms: 'O número de conectores SMS é maior que 1.',
    more_than_one_email: 'O número de conectores de e-mail é maior que 1.',
    more_than_one_connector_factory:
      'Foram encontradas várias fábricas de conectores (com id {{connectorIds}}), pode desinstalar as desnecessárias.',
    db_connector_type_mismatch: 'Há um conector no banco de dados que não corresponde ao tipo.',
    not_found_with_connector_id:
      'Não foi possível encontrar o conector com o id do conector padrão fornecido.',
    multiple_instances_not_supported:
      'Não é possível criar várias instâncias com o conector padrão selecionado.',
    invalid_type_for_syncing_profile:
      'Você só pode sincronizar o perfil do usuário com conectores sociais.',
    can_not_modify_target: "O 'target' do conector não pode ser modificado.",
    should_specify_target: 'Você deve especificar o alvo (target).',
    multiple_target_with_same_platform:
      'Não é possível ter vários conectores sociais com o mesmo alvo e plataforma.',
    cannot_overwrite_metadata_for_non_standard_connector:
      'Os metadados deste conector não podem ser sobrescritos.',
  },
  verification_code: {
    phone_email_empty: 'Tanto o telefone como o e-mail estão vazios.',
    not_found:
      'Código de verificação não encontrado. Por favor, envie primeiro o código de verificação.',
    phone_mismatch: 'Telefone não corresponde. Por favor, solicite um novo código de verificação.',
    email_mismatch: 'E-mail não corresponde. Por favor, solicite um novo código de verificação.',
    code_mismatch: 'Código de verificação inválido.',
    expired: 'O código de verificação expirou. Por favor, solicite um novo código de verificação.',
    exceed_max_try:
      'Limite máximo de tentativas de verificação excedido. Por favor, solicite um novo código de verificação.',
  },
  sign_in_experiences: {
    empty_content_url_of_terms_of_use:
      'URL dos "Termos de uso" vazio. Adicione o URL se os "Termos de uso" estiverem ativados.',
    empty_social_connectors:
      'Conectores sociais vazios. Adicione conectores sociais e ative os quando o método de login social estiver ativado.',
    enabled_connector_not_found: 'Conector {{type}} ativado não encontrado.',
    not_one_and_only_one_primary_sign_in_method:
      'Deve haver um e apenas um método de login principal. Por favor, verifique sua entrada.',
    username_requires_password:
      'É necessário habilitar a configuração de uma senha para o identificador de inscrição por nome de usuário.',
    passwordless_requires_verify:
      'É necessário habilitar a verificação para o identificador de inscrição por e-mail/telefone.',
    miss_sign_up_identifier_in_sign_in:
      'Os métodos de login devem conter o identificador de inscrição.',
    password_sign_in_must_be_enabled:
      'O login com senha deve ser habilitado quando é requerido configurar uma senha na inscrição.',
    code_sign_in_must_be_enabled:
      'O login com código de verificação deve ser habilitado quando não é requerido configurar uma senha na inscrição.',
    unsupported_default_language: 'Este idioma - {{language}} não é suportado no momento.',
    at_least_one_authentication_factor: 'Você deve selecionar pelo menos um fator de autenticação.',
  },
  localization: {
    cannot_delete_default_language:
      '{{languageTag}} é o seu idioma padrão e não pode ser excluído.',
    invalid_translation_structure:
      'Estrutura de dados inválida. Verifique sua entrada e tente novamente.',
  },
  swagger: {
    invalid_zod_type: 'Tipo de Zod inválido. Verifique a configuração do protetor de rota.',
    not_supported_zod_type_for_params:
      'Tipo Zod não suportado para os parâmetros. Verifique a configuração do protetor de rota.',
  },
  entity: {
    create_failed: 'Falha ao criar {{name}}.',
    not_exists: '{{name}} não existe.',
    not_exists_with_id: '{{name}} com o ID `{{id}}` não existe.',
    not_found: 'O recurso não existe.',
  },
  log: {
    invalid_type: 'O tipo de registro é inválido.',
  },
  role: {
    name_in_use: 'Este nome de função {{name}} já está em uso',
    scope_exists: 'O id do escopo {{scopeId}} já foi adicionado a esta função',
    user_exists: 'O id do usuário {{userId}} já foi adicionado a esta função',
    default_role_missing:
      'Alguns dos nomes de função padrão não existem no banco de dados, por favor, certifique-se de criar as funções primeiro',
    internal_role_violation:
      'Você pode estar tentando atualizar ou excluir uma função interna que é proibida pelo Logto. Se você estiver criando uma nova função, tente outro nome que não comece com "#internal:". ',
  },
  scope: {
    name_exists: 'O nome do escopo {{name}} já está em uso',
    name_with_space: 'O nome do escopo não pode conter espaços.',
  },
  storage: {
    not_configured: 'O provedor de armazenamento não está configurado.',
    missing_parameter: 'Faltando o parâmetro {{parameter}} para o provedor de armazenamento.',
    upload_error: 'Falha ao enviar o arquivo para o provedor de armazenamento.',
  },
};

export default errors;
