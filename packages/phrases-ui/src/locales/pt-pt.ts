import type { LocalePhrase } from '../types';

const translation = {
  input: {
    username: 'Utilizador',
    password: 'Password',
    email: 'Email',
    phone_number: 'Telefone',
    confirm_password: 'Confirmar password',
  },
  secondary: {
    sign_in_with: 'Entrar com {{methods, list(type: disjunction;)}}',
    register_with: 'Create account with {{methods, list(type: disjunction;)}}', // UNTRANSLATED
    social_bind_with:
      'Já tem uma conta? Faça login para agregar {{methods, list(type: disjunction;)}} com a sua identidade social.',
  },
  action: {
    sign_in: 'Entrar',
    continue: 'Continuar',
    create_account: 'Criar uma conta',
    create: 'Criar',
    enter_passcode: 'Digite a senha',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    save_password: 'Save', // UNTRANSLATED
    bind: 'Agregar a {{address}}',
    back: 'Voltar',
    nav_back: 'Anterior',
    agree: 'Aceito',
    got_it: 'Entendi',
    sign_in_with: 'Continuar com {{name}}',
    forgot_password: 'Esqueceu a password?',
    switch_to: 'Mudar para {{method}}',
    sign_in_via_passcode: 'Sign in with verification code', // UNTRANSLATED
    sign_in_via_password: 'Sign in with password', // UNTRANSLATED
  },
  description: {
    email: 'email',
    phone_number: 'telefone',
    reminder: 'Lembrete',
    not_found: '404 Não encontrado',
    agree_with_terms: 'Eu li e concordo com os ',
    agree_with_terms_modal: 'Para prosseguir, por favor, concorde com o <link></link>.',
    terms_of_use: 'Termos de uso',
    create_account: 'Criar uma conta',
    or: 'ou',
    enter_passcode: 'A senha foi enviada para o seu {{address}} {{target}}',
    passcode_sent: 'A senha foi reenviada',
    resend_after_seconds: 'Reenviar após <span>{{seconds}}</span> segundos',
    resend_passcode: 'Reenviar senha',
    continue_with: 'Continuar com',
    create_account_id_exists: 'A conta com {{type}} {{value}} já existe, gostaria de fazer login?',
    sign_in_id_does_not_exists: 'A conta com {{type}} {{value}} não existe, gostaria de criar uma?',
    sign_in_id_does_not_exists_alert: 'The account with {{type}} {{value}} does not exist.', // UNTRANSLATED
    create_account_id_exists_alert: 'The account with {{type}} {{value}} already exists', // UNTRANSLATED
    bind_account_title: 'Agregar conta',
    social_create_account: 'Sem conta? Pode criar uma nova e agregar.',
    social_bind_account: 'Já tem uma conta? Faça login para agregar a sua identidade social.',
    social_bind_with_existing: 'Encontramos uma conta relacionada, pode agrega-la diretamente.',
    reset_password: 'Redefinir Password',
    reset_password_description_email:
      'Digite o endereço de email associado à sua conta e enviaremos um email com o código de verificação para redefinir sua senha.',
    reset_password_description_sms:
      'Digite o número de telefone associado à sua conta e enviaremos uma mensagem de texto com o código de verificação para redefinir sua senha.',
    new_password: 'Nova Senha',
    set_password: 'Set password', // UNTRANSLATED
    password_changed: 'Password Changed', // UNTRANSLATED
    no_account: 'No account yet? ', // UNTRANSLATED
    have_account: 'Already had an account?', // UNTRANSLATED
    enter_password: 'Enter Password', // UNTRANSLATED
    enter_password_for: 'Sign in with the password to {{method}} {{value}}', // UNTRANSLATED
    enter_username: 'Enter username', // UNTRANSLATED
    enter_username_description:
      'Username is an alternative for sign-in. Username must contain only letters, numbers, and underscores.', // UNTRANSLATED
    link_email: 'Link email', // UNTRANSLATED
    link_phone: 'Link phone', // UNTRANSLATED
    link_email_or_phone: 'Link email or phone', // UNTRANSLATED
    link_email_description: 'Link your email to sign in or help with account recovery.', // UNTRANSLATED
    link_phone_description: 'Link your phone number to sign in or help with account recovery.', // UNTRANSLATED
    link_email_or_phone_description:
      'Link your email or phone number to sign in or help with account recovery.', // UNTRANSLATED
  },
  error: {
    username_password_mismatch: 'O Utilizador e a password não correspondem',
    username_required: 'Utilizador necessário',
    password_required: 'Password necessária',
    username_exists: 'O nome de utilizador já existe',
    username_should_not_start_with_number: 'O nome de utilizador não deve começar com um número',
    username_valid_charset:
      'O nome de utilizador deve conter apenas letras, números ou underscores.',
    invalid_email: 'O email é inválido',
    invalid_phone: 'O número de telefone é inválido',
    password_min_length: 'A password requer um mínimo de {{min}} caracteres',
    passwords_do_not_match: 'As passwords não coincidem',
    invalid_passcode: 'A senha é inválida',
    invalid_connector_auth: 'A autorização é inválida',
    invalid_connector_request: 'Os dados do conector são inválidos',
    unknown: 'Erro desconhecido. Por favor, tente novamente mais tarde.',
    invalid_session: 'Sessão não encontrada. Volte e faça login novamente.',
  },
};

const ptPT: LocalePhrase = Object.freeze({
  translation,
});

export default ptPT;
