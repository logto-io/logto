import { LocalePhrase } from '../types';

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
    bind: 'Agregar a {{address}}',
    back: 'Voltar',
    nav_back: 'Anterior',
    agree: 'Aceito',
    got_it: 'Entendi',
    sign_in_with: 'Entrar com {{name}}',
    forgot_password: 'Esqueceu a password?',
    switch_to: 'Mudar para {{method}}',
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
    enter_passcode: 'A senha foi enviada para o seu {{address}}',
    passcode_sent: 'A senha foi reenviada',
    resend_after_seconds: 'Reenviar após <span>{{seconds}}</span> segundos',
    resend_passcode: 'Reenviar senha',
    continue_with: 'Continuar com',
    create_account_id_exists: 'A conta com {{type}} {{value}} já existe, gostaria de fazer login?',
    sign_in_id_does_not_exists: 'A conta com {{type}} {{value}} não existe, gostaria de criar uma?',
    forgot_password_id_does_not_exits: 'The account with {{type}} {{value}} does not exist.', // UNTRANSLATED
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
    password_changed: 'Password Changed', // UNTRANSLATED
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
