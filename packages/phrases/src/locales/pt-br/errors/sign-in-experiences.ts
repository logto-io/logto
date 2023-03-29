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
};
export default sign_in_experiences;
