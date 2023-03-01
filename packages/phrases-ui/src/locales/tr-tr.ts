import type { LocalePhrase } from '../types.js';

const translation = {
  input: {
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    email: 'E-posta Adresi',
    phone_number: 'Telefon Numarası',
    confirm_password: 'Şifreyi Doğrula',
  },
  secondary: {
    social_bind_with:
      'Hesabınız zaten var mı? {{methods, list(type: disjunction;)}} bağlantısına tıklayarak giriş yapabilirsiniz',
  },
  action: {
    sign_in: 'Giriş Yap',
    continue: 'İlerle',
    create_account: 'Hesap Oluştur',
    create_account_without_linking: 'Create account without linking', // UNTRANSLATED
    create: 'Oluştur',
    enter_passcode: 'Kodu Gir',
    confirm: 'Onayla',
    cancel: 'İptal Et',
    save_password: 'Save', // UNTRANSLATED
    bind: '{{address}} ile birleştir',
    bind_and_continue: 'Link and continue', // UNTRANSLATED
    back: 'Geri Dön',
    nav_back: 'Geri',
    agree: 'Kabul Et',
    got_it: 'Anladım',
    sign_in_with: '{{name}} ile ilerle',
    forgot_password: 'Şifremi Unuttum?',
    switch_to: 'Switch to {{method}}', // UNTRANSLATED
    sign_in_via_passcode: 'Sign in with verification code', // UNTRANSLATED
    sign_in_via_password: 'Sign in with password', // UNTRANSLATED
    change: 'Change {{method}}', // UNTRANSLATED
    link_another_email: 'Link another email', // UNTRANSLATED
    link_another_phone: 'Link another phone', // UNTRANSLATED
    link_another_email_or_phone: 'Link another email or phone', // UNTRANSLATED
    show_password: 'Show password', // UNTRANSLATED
  },
  description: {
    email: 'e-posta adresi',
    phone_number: 'telefon numarası',
    username: 'kullanıcı Adı',
    reminder: 'Hatırlatıcı',
    not_found: '404 Bulunamadı',
    agree_with_terms: 'Okudum ve anladım',
    agree_with_terms_modal: 'Devam etmek için lütfen <link></link>i kabul edin.',
    terms_of_use: 'Kullanım Koşulları',
    create_account: 'Hesap Oluştur',
    or: 'veya',
    enter_passcode: 'Kod {{address}} {{target}} inize gönderildi.',
    passcode_sent: 'Kodunuz yeniden gönderildi.',
    resend_after_seconds: '<span>{{seconds}}</span> saniye sonra tekrar gönder',
    resend_passcode: 'Kodu Yeniden Gönder',
    create_account_id_exists: '{{type}} {{value}} ile hesap mevcut, giriş yapmak ister misiniz?',
    link_account_id_exists:
      'The account with {{type}} {{value}} already exists, would you like to link?', // UNTRANSLATED
    sign_in_id_does_not_exist:
      '{{type}} {{value}} ile hesap mevcut değil, yeni bir hesap oluşturmak ister misiniz?',
    sign_in_id_does_not_exist_alert: 'The account with {{type}} {{value}} does not exist.', // UNTRANSLATED
    create_account_id_exists_alert:
      'The account with {{type}} {{value}} is linked to another account. Please try another {{type}}.', // UNTRANSLATED
    social_identity_exist:
      'The {{type}} {{value}} is linked to another account. Please try another {{type}}', // UNTRANSLATED
    bind_account_title: 'Link or create account', // UNTRANSLATED
    social_create_account: 'Hesabınız yok mu? Yeni bir hesap ve bağlantı oluşturabilirsiniz.',
    social_link_email: 'You can link another email', // UNTRANSLATED,
    social_link_phone: 'You can link another phone', // UNTRANSLATED,
    social_link_email_or_phone: 'You can link another email or phone', // UNTRANSLATED,
    social_bind_with_existing: 'İlgili bir hesap bulduk, hemen bağlayabilirsiniz.',
    reset_password: 'Şifre yenile',
    reset_password_description:
      'Enter the {{types, list(type: disjunction;)}} associated with your account, and we’ll send you the verification code to reset your password.', // UNTRANSLATED
    new_password: 'Yeni Şifre',
    set_password: 'Set password', // UNTRANSLATED
    password_changed: 'Password Changed', // UNTRANSLATED
    no_account: 'No account yet? ', // UNTRANSLATED
    have_account: 'Already had an account?', // UNTRANSLATED
    enter_password: 'Enter Password', // UNTRANSLATED
    enter_password_for: 'Sign in with the password to {{method}} {{value}}', // UNTRANSLATED
    enter_username: 'Set username', // UNTRANSLATED
    enter_username_description:
      'Username is an alternative for sign-in. Username must contain only letters, numbers, and underscores.', // UNTRANSLATED
    link_email: 'Link email', // UNTRANSLATED
    link_phone: 'Link phone', // UNTRANSLATED
    link_email_or_phone: 'Link email or phone', // UNTRANSLATED
    link_email_description: 'For added security, please link your email with the account.', // UNTRANSLATED
    link_phone_description: 'For added security, please link your phone with the account.', // UNTRANSLATED
    link_email_or_phone_description:
      'For added security, please link your email or phone with the account.', // UNTRANSLATED
    continue_with_more_information: 'For added security, please complete below account details.', // UNTRANSLATED
  },
  error: {
    general_required: `{{types, list(type: disjunction;)}} is required`, // UNTRANSLATED
    general_invalid: `The {{types, list(type: disjunction;)}} is invalid`, // UNTRANSLATED
    username_required: 'Kullanıcı adı gerekli.',
    password_required: 'Şifre gerekli.',
    username_exists: 'Kullanıcı adı mevcut.',
    username_should_not_start_with_number: 'Kullanıcı adı sayı ile başlayamaz.',
    username_invalid_charset: 'Kullanıcı adı yalnızca harf,sayı veya alt çizgi içermeli.',
    invalid_email: 'E-posta adresi geçersiz',
    invalid_phone: 'Telefon numarası geçersiz',
    password_min_length: 'Şifre en az {{min}} karakterden oluşmalıdır',
    passwords_do_not_match: 'Şifreler eşleşmiyor',
    invalid_passcode: 'Kod geçersiz',
    invalid_connector_auth: 'Yetki geçersiz',
    invalid_connector_request: 'Bağlayıcı veri geçersiz',
    unknown: 'Bilinmeyen hata. Lütfen daha sonra tekrar deneyiniz.',
    invalid_session: 'Oturum bulunamadı. Lütfen geri dönüp tekrar giriş yapınız.',
  },
  demo_app: {
    notification: 'Before trying the sign-in experience, please create an account first.', // UNTRANSLATED
  },
};

const trTR: LocalePhrase = Object.freeze({
  translation,
});

export default trTR;
