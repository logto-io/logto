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
};
export default sign_in_experiences;
