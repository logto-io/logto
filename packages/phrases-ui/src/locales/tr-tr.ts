import type { LocalePhrase } from '../types';

const translation = {
  input: {
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    email: 'E-posta Adresi',
    phone_number: 'Telefon Numarası',
    confirm_password: 'Şifreyi Doğrula',
  },
  secondary: {
    sign_in_with: '{{methods, list(type: disjunction;)}} ile giriş yapınız',
    register_with: 'Create account with {{methods, list(type: disjunction;)}}', // UNTRANSLATED
    social_bind_with:
      'Hesabınız zaten var mı? {{methods, list(type: disjunction;)}} bağlantısına tıklayarak giriş yapabilirsiniz',
  },
  action: {
    sign_in: 'Giriş Yap',
    continue: 'İlerle',
    create_account: 'Hesap Oluştur',
    create: 'Oluştur',
    enter_passcode: 'Kodu Gir',
    confirm: 'Onayla',
    cancel: 'İptal Et',
    save_password: 'Save', // UNTRANSLATED
    bind: '{{address}} ile birleştir',
    back: 'Geri Dön',
    nav_back: 'Geri',
    agree: 'Kabul Et',
    got_it: 'Anladım',
    sign_in_with: '{{name}} ile ilerle',
    forgot_password: 'Şifremi Unuttum?',
    switch_to: 'Switch to {{method}}', // UNTRANSLATED
    sign_in_via_passcode: 'Sign in via verification code', // UNTRANSLATED
  },
  description: {
    email: 'e-posta adresi',
    phone_number: 'telefon numarası',
    reminder: 'Hatırlatıcı',
    not_found: '404 Bulunamadı',
    agree_with_terms: 'Okudum ve anladım',
    agree_with_terms_modal: 'Devam etmek için lütfen <link></link>i kabul edin.',
    terms_of_use: 'Kullanım Koşulları',
    create_account: 'Hesap Oluştur',
    or: 'veya',
    enter_passcode: 'Kod {{address}}inize gönderildi.',
    passcode_sent: 'Kodunuz yeniden gönderildi.',
    resend_after_seconds: '<span>{{seconds}}</span> saniye sonra tekrar gönder',
    resend_passcode: 'Kodu Yeniden Gönder',
    continue_with: 'İle devam et',
    create_account_id_exists: '{{type}} {{value}} ile hesap mevcut, giriş yapmak ister misiniz?',
    sign_in_id_does_not_exists:
      '{{type}} {{value}} ile hesap mevcut değil, yeni bir hesap oluşturmak ister misiniz?',
    forgot_password_id_does_not_exits: 'The account with {{type}} {{value}} does not exist.', // UNTRANSLATED
    bind_account_title: 'Hesap bağla',
    social_create_account: 'Hesabınız yok mu? Yeni bir hesap ve bağlantı oluşturabilirsiniz.',
    social_bind_account: 'Hesabınız zaten var mı? Hesabınıza bağlanmak için giriş yapınız.',
    social_bind_with_existing: 'İlgili bir hesap bulduk, hemen bağlayabilirsiniz.',
    reset_password: 'Şifre yenile',
    reset_password_description_email:
      'Hesabınızla ilişkili e-posta adresini girin, şifrenizi sıfırlamak için size doğrulama kodunu e-posta ile gönderelim.',
    reset_password_description_sms:
      'Hesabınızla ilişkili telefon numarasını girin, şifrenizi sıfırlamak için size doğrulama kodunu kısa mesajla gönderelim.',
    new_password: 'Yeni Şifre',
    password_changed: 'Password Changed', // UNTRANSLATED
    no_account: "Don't have an account?", // UNTRANSLATED
    have_account: 'Already have an account?', // UNTRANSLATED
    enter_password: 'Enter Password', // UNTRANSLATED
    enter_password_for: 'Enter the password of {{method}} {{value}}', // UNTRANSLATED
  },
  error: {
    username_password_mismatch: 'Kullanıcı adı ve şifre eşleşmiyor.',
    username_required: 'Kullanıcı adı gerekli.',
    password_required: 'Şifre gerekli.',
    username_exists: 'Kullanıcı adı mevcut.',
    username_should_not_start_with_number: 'Kullanıcı adı sayı ile başlayamaz.',
    username_valid_charset: 'Kullanıcı adı yalnızca harf,sayı veya alt çizgi içermeli.',
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
};

const trTR: LocalePhrase = Object.freeze({
  translation,
});

export default trTR;
