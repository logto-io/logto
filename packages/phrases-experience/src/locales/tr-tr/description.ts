const description = {
  email: 'e-posta adresi',
  phone_number: 'telefon numarası',
  username: 'kullanıcı Adı',
  reminder: 'Hatırlatıcı',
  not_found: '404 Bulunamadı',
  agree_with_terms: 'Okudum ve anladım',
  agree_with_terms_modal: "Devam etmek için lütfen <link></link>'i kabul edin.",
  terms_of_use: 'Kullanım Koşulları',
  sign_in: 'Giriş Yap',
  privacy_policy: 'Gizlilik Politikası',
  create_account: 'Hesap Oluştur',
  or: 'veya',
  and: 've',
  enter_passcode: 'Doğrulama kodu {{address}} {{target}} adresinize gönderildi',
  passcode_sent: 'Doğrulama kodu yeniden gönderildi',
  resend_after_seconds: '<span>{{seconds}}</span> saniye sonra tekrar gönder',
  resend_passcode: 'Doğrulama kodunu tekrar gönder',
  create_account_id_exists: '{{type}} {{value}} ile hesap mevcut, giriş yapmak ister misiniz?',
  link_account_id_exists: '{{type}} {{value}} olan hesap zaten var, bağlamak ister misiniz?',
  sign_in_id_does_not_exist:
    '{{type}} {{value}} ile hesap mevcut değil, yeni bir hesap oluşturmak ister misiniz?',
  sign_in_id_does_not_exist_alert: '{{type}} {{value}} olan hesap mevcut değil.',
  create_account_id_exists_alert:
    '{{type}} {{value}} olan hesap başka bir hesaba bağlı. Lütfen başka bir {{type}} deneyin.',
  social_identity_exist:
    '{{type}} {{value}} başka bir hesaba bağlı. Lütfen başka bir {{type}} deneyin.',
  bind_account_title: 'Bağla veya hesap oluştur',
  social_create_account: 'Yeni bir hesap oluşturabilirsiniz.',
  social_link_email: 'Başka bir e-posta bağlayabilirsiniz',
  social_link_phone: 'Başka bir telefon bağlayabilirsiniz',
  social_link_email_or_phone: 'Başka bir e-posta veya telefon bağlayabilirsiniz',
  social_bind_with_existing: 'Kayıtlı ilgili bir hesap bulduk ve onu doğrudan bağlayabilirsiniz.',
  reset_password: 'Parolanızı mı unuttunuz',
  reset_password_description:
    'Hesabınızla ilişkili {{types, list(type: disjunction;)}} girin, şifrenizi sıfırlamanız için size doğrulama kodunu göndereceğiz.',
  new_password: 'Yeni Şifre',
  set_password: 'Şifreyi belirle',
  password_changed: 'Şifre değişti',
  no_account: 'Henüz hesap yok mu?',
  have_account: 'Zaten bir hesabınız var mıydı?',
  enter_password: 'Parolanı Gir',
  enter_password_for: '{{method}} {{value}} şifresiyle oturum açın',
  enter_username: 'Kullanıcı adını ayarla',
  enter_username_description:
    'Kullanıcı adı, oturum açmak için bir alternatiftir. Kullanıcı adı yalnızca harf, sayı ve alt çizgi içermelidir.',
  link_email: 'E-postayı bağla',
  link_phone: 'Telefonu bağla',
  link_email_or_phone: 'E-posta veya telefon bağlantısı',
  link_email_description: 'Daha fazla güvenlik için lütfen e-postanızı hesapla ilişkilendirin.',
  link_phone_description: 'Daha fazla güvenlik için lütfen telefonunuzu hesaba bağlayın.',
  link_email_or_phone_description:
    'Daha fazla güvenlik için lütfen e-postanızı veya telefonunuzu hesaba bağlayın.',
  continue_with_more_information:
    'Daha fazla güvenlik için lütfen aşağıdaki hesap ayrıntılarını tamamlayın.',
  create_your_account: 'Hesabını oluştur',
  sign_in_to_your_account: 'Hesabına giriş yap',
  no_region_code_found: 'Bölge kodu bulunamadı',
  verify_email: 'E-postanızın doğrulanması',
  verify_phone: 'Telefon numaranızın doğrulanması',
  password_requirements: 'Şifre {{items, list}}.',
  password_requirement: {
    length_one: 'en az {{count}} karakter gerektirir',
    length_other: 'en az {{count}} karakter gerektirir',
    character_types_one: 'en az {{count}} tane büyük harf, küçük harf, rakam ve sembol içermelidir',
    character_types_other:
      'en az {{count}} tane büyük harf, küçük harf, rakam ve sembol içermelidir',
  },
  use: 'Kullan',
  single_sign_on_email_form: 'Kurumsal e-posta adresinizi girin',
  single_sign_on_connectors_list:
    'Şirketiniz, {{email}} e-posta hesabı için Tekli Oturum Açmayı (Single Sign-On) etkinleştirdi. Aşağıdaki SSO sağlayıcıları ile oturum açmaya devam edebilirsiniz.',
  single_sign_on_enabled: 'Bu hesapta Tekli Oturum Açma etkinleştirildi.',
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
