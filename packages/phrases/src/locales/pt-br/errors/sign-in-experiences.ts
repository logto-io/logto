const sign_in_experiences = {
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
  backup_code_cannot_be_enabled_alone: 'Código de backup não pode ser ativado sozinho.',
  duplicated_mfa_factors: 'Fatores MFA duplicados.',
  email_verification_code_cannot_be_used_for_mfa:
    'O código de verificação de e-mail não pode ser usado para MFA quando a verificação de e-mail é ativada para login.',
  phone_verification_code_cannot_be_used_for_mfa:
    'O código de verificação por SMS não pode ser usado para MFA quando a verificação por SMS é ativada para login.',
  email_verification_code_cannot_be_used_for_sign_in:
    'O código de verificação de e-mail não pode ser usado para login quando é ativado para MFA.',
  phone_verification_code_cannot_be_used_for_sign_in:
    'O código de verificação por SMS não pode ser usado para login quando é ativado para MFA.',
  duplicated_sign_up_identifiers: 'Identificadores de inscrição duplicados detectados.',
  missing_sign_up_identifiers: 'O identificador principal de inscrição não pode estar vazio.',
  invalid_custom_email_blocklist_format:
    'Itens de lista de bloqueio personalizados de email inválidos: {{items, list(type:conjunction)}}. Cada item deve ser um endereço de email válido ou domínio de email, por exemplo, foo@example.com ou @example.com.',
  forgot_password_method_requires_connector:
    'O método de esquecimento de senha requer um conector {{method}} correspondente para ser configurado.',
};

export default Object.freeze(sign_in_experiences);
