const errors = {
  auth: {
    authorization_header_missing: 'O cabeçalho de autorização está ausente.',
    authorization_token_type_not_supported: 'O tipo de autorização não é suportado.',
    unauthorized: 'Não autorizado. Verifique as credenciais e o scope.',
    forbidden: 'Proibido. Verifique os seus cargos e permissões.',
    expected_role_not_found: 'Role esperado não encontrado. Verifique os seus cargos e permissões.',
    jwt_sub_missing: 'Campo `sub` está ausente no JWT.',
  },
  guard: {
    invalid_input: 'O pedido {{type}} é inválido.',
    invalid_pagination: 'O valor de paginação enviado é inválido.',
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
    username_exists_register: 'Já existe um utilizador com esse nome de utilizador.',
    email_exists_register: 'Já existe um utilizador com esse endereço de email.',
    phone_exists_register: 'Já existe um utilizador com esse numero do telefone.',
    invalid_email: 'Endereço de email inválido.',
    invalid_phone: 'Número de telefone inválido.',
    email_not_exists: 'O endereço de email ainda não foi registada.',
    phone_not_exists: 'O numero do telefone ainda não foi registada.',
    identity_not_exists: 'A conta social ainda não foi registada.',
    identity_exists: 'A conta social foi registada.',
    invalid_role_names: '({{roleNames}}) não são válidos',
    cannot_delete_self: 'Não se pode remover a si mesmo.',
    same_password: 'Your new password can not be the same as current password.', // UNTRANSLATED
    sign_up_method_not_enabled: 'This sign up method is not enabled.', // UNTRANSLATED
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
    forgot_password_session_not_found:
      'Forgot password session not found. Please go back and verify.', // UNTRANSLATED
    forgot_password_verification_expired:
      'Forgot password verification has expired. Please go back and verify again.', // UNTRANSLATED
    unauthorized: 'Faça login primeiro.',
    unsupported_prompt_name: 'Nome de prompt não suportado.',
    forgot_password_not_enabled: 'Forgot password is not enabled.', // UNTRANSLATED
  },
  connector: {
    general: 'Ocorreu um erro inesperado no conector.{{errorDescription}}',
    not_found: 'Não é possível encontrar nenhum conector disponível para o tipo: {{type}}.',
    not_enabled: 'O conector não está ativo.',
    invalid_metadata: 'Os metadados do conector são inválidos.',
    invalid_config_guard: 'A configuração de proteção do conector é inválida.',
    unexpected_type: 'O tipo do conector é inesperado.',
    invalid_request_parameters: 'The request is with wrong input parameter(s).', // UNTRANSLATED
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
    db_connector_type_mismatch: 'Há um conector no banco de dados que não corresponde ao tipo.',
  },
  passcode: {
    phone_email_empty: 'O campos telefone e email estão vazios.',
    not_found: 'Senha não encontrada. Por favor, envie a senha primeiro.',
    phone_mismatch: 'O telefone não correspond. Por favor, solicite uma nova senha.',
    email_mismatch: 'O email não corresponde. Por favor, solicite uma nova senha.',
    code_mismatch: 'Senha inválida.',
    expired: 'A senha expirou. Por favor, solicite uma nova senha.',
    exceed_max_try:
      'Limitação de verificação de senha excedida. Por favor, solicite uma nova senha.',
  },
  sign_in_experiences: {
    empty_content_url_of_terms_of_use:
      'URL dos "Termos de uso" vazio. Adicione o URL se os "Termos de uso" estiverem ativados.',
    empty_logo: 'Insira o URL do seu logotipo',
    empty_slogan:
      'Slogan de marca vazio. Adicione um slogan se o estilo da interface com o slogan for selecionado.',
    empty_social_connectors:
      'Conectores sociais vazios. Adicione conectores sociais e ative os quando o método de login social estiver ativado.',
    enabled_connector_not_found: 'Conector {{type}} ativado não encontrado.',
    not_one_and_only_one_primary_sign_in_method:
      'Deve haver um e apenas um método de login principal. Por favor, verifique sua entrada.',
    username_requires_password: 'Must enable set a password for username sign up identifier.', // UNTRANSLATED
    passwordless_requires_verify: 'Must enable verify for email/phone sign up identifier.', // UNTRANSLATED
    miss_sign_up_identifier_in_sign_in: 'Sign in methods must contain the sign up identifier.', // UNTRANSLATED
    password_sign_in_must_be_enabled:
      'Password sign in must be enabled when set a password is required in sign up.', // UNTRANSLATED
    code_sign_in_must_be_enabled:
      'Verification code sign in must be enabled when set a password is not required in sign up.', // UNTRANSLATED
    unsupported_default_language: 'This language - {{language}} is not supported at the moment.', // UNTRANSLATED
  },
  localization: {
    cannot_delete_default_language:
      '{{languageTag}} is set as your default language and can’t be deleted.', // UNTRANSLATED
    invalid_translation_structure: 'Invalid data schemas. Please check your input and try again.', // UNTRANSLATED
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
};

export default errors;
