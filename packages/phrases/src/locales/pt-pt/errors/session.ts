const session = {
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
};
export default session;
