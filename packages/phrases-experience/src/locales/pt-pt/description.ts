const description = {
  email: 'email',
  phone_number: 'telefone',
  username: 'utilizador',
  reminder: 'Lembrete',
  not_found: '404 Não encontrado',
  agree_with_terms: 'Eu li e concordo com os ',
  agree_with_terms_modal: 'Para prosseguir, por favor, concorde com o <link></link>.',
  terms_of_use: 'Termos de uso',
  sign_in: 'Entrar',
  privacy_policy: 'Política de privacidade',
  create_account: 'Criar uma conta',
  or: 'ou',
  and: 'e',
  enter_passcode: 'O código de verificação foi enviado para o seu {{address}} {{target}}',
  passcode_sent: 'O código de verificação foi reenviado',
  resend_after_seconds: 'Reenviar após <span>{{seconds}}</span> segundos',
  resend_passcode: 'Reenviar código de verificação',
  create_account_id_exists: 'A conta com {{type}} {{value}} já existe, gostaria de fazer login?',
  link_account_id_exists: 'A conta com {{type}} {{value}} já existe, gostaria de vinculá-la?',
  sign_in_id_does_not_exist: 'A conta com {{type}} {{value}} não existe, gostaria de criar uma?',
  sign_in_id_does_not_exist_alert: 'A conta com {{type}} {{value}} não existe.',
  create_account_id_exists_alert:
    'A conta com {{type}} {{value}} está vinculada a outra conta. Por favor, tente outro {{type}}.',
  social_identity_exist:
    'O {{type}} {{value}} está vinculado a outra conta. Por favor, tente outro {{type}}.',
  bind_account_title: 'Vincular ou criar conta',
  social_create_account: 'Pode criar uma nova conta.',
  social_link_email: 'Pode vincular outro email',
  social_link_phone: 'Pode vincular outro telefone',
  social_link_email_or_phone: 'Pode vincular outro email ou telefone',
  social_bind_with_existing:
    'Encontramos uma conta relacionada registrada e você pode vinculá-la diretamente.',
  reset_password: 'Esqueceu a senha',
  reset_password_description:
    'Insira os {{types, list(type: disjunction;)}} associados à sua conta e enviaremos o código de verificação para redefinir sua senha.',
  new_password: 'Nova Senha',
  set_password: 'Definir senha',
  password_changed: 'Senha alterada',
  no_account: 'Ainda não tem conta?',
  have_account: 'Já tem conta?',
  enter_password: 'Digite a senha',
  enter_password_for: 'Faça login com a senha do {{method}} {{value}}',
  enter_username: 'Definir nome de usuário',
  enter_username_description:
    'O nome de usuário é uma alternativa para o login. O nome de usuário deve conter apenas letras, números e sublinhados.',
  link_email: 'Vincular email',
  link_phone: 'Vincular telefone',
  link_email_or_phone: 'Vincular email ou telefone',
  link_email_description: 'Para maior segurança, vincule o seu email à conta.',
  link_phone_description: 'Para maior segurança, vincule o seu telefone à conta.',
  link_email_or_phone_description: 'Para maior segurança, vincule o seu email ou telefone à conta.',
  continue_with_more_information:
    'Para maior segurança, por favor complete os detalhes da conta abaixo.',
  create_your_account: 'Crie a sua conta',
  sign_in_to_your_account: 'Inicie sessão na sua conta',
  no_region_code_found: 'Não foi possível encontrar o código de região do seu telefone.',
  verify_email: 'Verifique o seu email',
  verify_phone: 'Verifique o seu número de telefone',
  password_requirements: 'Requisitos de senha {{items, list}}.',
  password_requirement: {
    length_one: 'requer um mínimo de {{count}} caracter',
    length_other: 'requer um mínimo de {{count}} caracteres',
    character_types_one:
      'deve conter pelo menos {{count}} tipo de letras maiúsculas, letras minúsculas, dígitos e símbolos',
    character_types_other:
      'deve conter pelo menos {{count}} tipos de letras maiúsculas, letras minúsculas, dígitos e símbolos',
  },
  use: 'Usar',
  single_sign_on_email_form: 'Insira o endereço de email corporativo',
  single_sign_on_connectors_list:
    'A sua empresa ativou o Single Sign-On para a conta de email {{email}}. Pode continuar a iniciar sessão com os seguintes fornecedores de SSO.',
  single_sign_on_enabled: 'Esta conta tem o Single Sign-On ativado.',
  /** UNTRANSLATED */
  authorize_title: 'Authorize {{name}}',
  /** UNTRANSLATED */
  request_permission: '{{name}} is requesting access to:',
  /** UNTRANSLATED */
  grant_organization_access: 'Grant the organization access:',
  /** UNTRANSLATED */
  authorize_personal_data_usage: 'Authorize the use of your personal data:',
  /** UNTRANSLATED */
  authorize_organization_access: 'Authorize access to the specific organization:',
  /** UNTRANSLATED */
  user_scopes: 'Personal user data',
  /** UNTRANSLATED */
  organization_scopes: 'Organization access',
  /** UNTRANSLATED */
  authorize_agreement: `By authorizing the access, you agree to the {{name}}'s <link></link>.`,
  /** UNTRANSLATED */
  authorize_agreement_with_redirect: `By authorizing the access, you agree to the {{name}}'s <link></link>, and will be redirected to {{uri}}.`,
  /** UNTRANSLATED */
  not_you: 'Not you?',
  /** UNTRANSLATED */
  user_id: 'User ID: {{id}}',
  /** UNTRANSLATED */
  redirect_to: 'You will be redirected to {{name}}.',
};

export default Object.freeze(description);
