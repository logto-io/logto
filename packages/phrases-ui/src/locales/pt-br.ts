import type { LocalePhrase } from '../types.js';

const translation = {
  input: {
    username: 'Nome de usuário',
    password: 'Senha',
    email: 'E-mail',
    phone_number: 'Número de telefone',
    confirm_password: 'Confirme a senha',
  },
  secondary: {
    sign_in_with: 'Entrar com {{methods, list(type: disjunction;)}}',
    register_with: 'Criar conta com {{methods, list(type: disjunction;)}}',
    social_bind_with:
      'Já tinha uma conta? Faça login no link {{methods, list(type: disjunction;)}} com sua identidade social.',
  },
  action: {
    sign_in: 'Entrar',
    continue: 'Continuar',
    create_account: 'Criar conta',
    create: 'Criar',
    enter_passcode: 'Digite o código de verificação',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    save_password: 'Salvar',
    bind: 'Link com {{address}}',
    back: 'Voltar',
    nav_back: 'Voltar',
    agree: 'Aceito',
    got_it: 'Entendido',
    sign_in_with: 'Continuar com {{name}}',
    forgot_password: 'Esqueceu sua senha?',
    switch_to: 'Trocar para {{method}}',
    sign_in_via_passcode: 'Entrar com código de verificação',
    sign_in_via_password: 'Entrar com senha',
  },
  description: {
    email: 'e-mail',
    phone_number: 'número de telefone',
    reminder: 'Lembrete',
    not_found: '404 Não Encontrado',
    agree_with_terms: 'Eu li e concordo com os ',
    agree_with_terms_modal: 'Para continuar, por favor, concorde com os <link></link>.',
    terms_of_use: 'Termos de uso',
    create_account: 'Criar conta',
    or: 'ou',
    enter_passcode: 'O código de verificação foi enviado para o seu {{address}} {{target}}',
    passcode_sent: 'O código de verificação foi reenviado',
    resend_after_seconds: 'Reenviar depois <span>{{seconds}}</span> segundos',
    resend_passcode: 'Reenviar código de verificação',
    continue_with: 'Continue com',
    create_account_id_exists: 'A conta com {{type}} {{value}} já existe, gostaria de entrar?',
    sign_in_id_does_not_exist:
      'A conta com {{type}} {{value}} não existe, gostaria de criar uma nova conta?',
    sign_in_id_does_not_exist_alert: 'A conta com {{type}} {{value}} não existe.',
    create_account_id_exists_alert: 'A conta com {{type}} {{value}} já existe',
    bind_account_title: 'Link da conta',
    social_create_account: 'Sem conta? Você pode criar uma nova conta e link.',
    social_bind_account: 'Já tinha uma conta? Faça login para vinculá-lo à sua identidade social.',
    social_bind_with_existing:
      'Encontramos uma conta relacionada, você pode vinculá-la diretamente.',
    reset_password: 'Redefinir senha',
    reset_password_description_email:
      'Digite o endereço de e-mail associado à sua conta e enviaremos por e-mail o código de verificação para redefinir sua senha.',
    reset_password_description_sms:
      'Digite o número de telefone associado à sua conta e enviaremos a você o código de verificação para redefinir sua senha.',
    new_password: 'Nova senha',
    set_password: 'Configurar senha',
    password_changed: 'Senha alterada',
    no_account: 'Ainda não tem conta? ',
    have_account: 'Já tinha uma conta?',
    enter_password: 'Digite a senha',
    enter_password_for: 'Entre com a senha para {{method}} {{value}}',
    enter_username: 'Insira nome de usuário',
    enter_username_description:
      'O nome de usuário é uma alternativa para entrar. O nome de usuário deve conter apenas letras, números e sublinhados.',
    link_email: 'Link e-mail',
    link_phone: 'Link telefone',
    link_email_or_phone: 'Link e-mail ou telefone',
    link_email_description: 'Para maior segurança, vincule seu e-mail à conta.',
    link_phone_description: 'Para maior segurança, vincule seu telefone à conta.',
    link_email_or_phone_description:
      'Para maior segurança, vincule seu e-mail ou telefone à conta.',
    continue_with_more_information: 'Para maior segurança, preencha os detalhes da conta abaixo.',
  },
  error: {
    username_password_mismatch: 'Usuário e senha não correspondem',
    username_required: 'Nome de usuário é obrigatório',
    password_required: 'Senha é obrigatório',
    username_exists: 'O nome de usuário já existe',
    username_should_not_start_with_number: 'O nome de usuário não deve começar com um número',
    username_valid_charset: 'O nome de usuário deve conter apenas letras, números ou sublinhados.',
    invalid_email: 'O e-mail é inválido',
    invalid_phone: 'O número de telefone é inválido',
    password_min_length: 'A senha requer um mínimo de {{min}} caracteres',
    passwords_do_not_match: 'Suas senhas não correspondem. Por favor, tente novamente.',
    invalid_passcode: 'O código de verificação é inválido',
    invalid_connector_auth: 'A autorização é inválida',
    invalid_connector_request: 'Os dados do conector são inválidos',
    unknown: 'Erro desconhecido. Por favor, tente novamente mais tarde.',
    invalid_session: 'Sessão não encontrada. Volte e faça login novamente.',
  },
};

const ptBR: LocalePhrase = Object.freeze({
  translation,
});

export default ptBR;
