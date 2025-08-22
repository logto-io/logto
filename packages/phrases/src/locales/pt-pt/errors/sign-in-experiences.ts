const sign_in_experiences = {
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
  backup_code_cannot_be_enabled_alone: 'O código de backup não pode ser ativado sozinho.',
  duplicated_mfa_factors: 'Fatores MFA duplicados.',
  email_verification_code_cannot_be_used_for_mfa:
    'O código de verificação por email não pode ser usado para MFA quando a verificação por email está ativada para login.',
  phone_verification_code_cannot_be_used_for_mfa:
    'O código de verificação por SMS não pode ser usado para MFA quando a verificação por SMS está ativada para login.',
  email_verification_code_cannot_be_used_for_sign_in:
    'O código de verificação por email não pode ser usado para login quando está ativado para MFA.',
  phone_verification_code_cannot_be_used_for_sign_in:
    'O código de verificação por SMS não pode ser usado para login quando está ativado para MFA.',
  duplicated_sign_up_identifiers: 'Identificadores de inscrição duplicados detectados.',
  missing_sign_up_identifiers: 'O identificador de inscrição principal não pode estar vazio.',
  invalid_custom_email_blocklist_format:
    'Itens da lista de bloqueio de email personalizada inválidos: {{items, list(type:conjunction)}}. Cada item deve ser um endereço de email ou domínio de email válido, ex.: foo@example.com ou @example.com.',
  forgot_password_method_requires_connector:
    'O método de recuperação de senha requer um conector {{method}} correspondente a ser configurado.',
};

export default Object.freeze(sign_in_experiences);
