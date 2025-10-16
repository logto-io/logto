import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'تجربة تسجيل الدخول',
  page_title_with_account: 'تسجيل الدخول والحساب',
  title: 'تسجيل الدخول والحساب',
  description: 'تخصيص تدفقات المصادقة وواجهة المستخدم، ومعاينة التجربة الافتراضية في الوقت الفعلي.',
  tabs: {
    branding: 'العلامة التجارية',
    sign_up_and_sign_in: 'التسجيل وتسجيل الدخول',
    collect_user_profile: 'جمع ملف تعريف المستخدم',
    account_center: 'مركز الحساب',
    content: 'المحتوى',
    password_policy: 'سياسة كلمة المرور',
  },
  welcome: {
    title: 'تخصيص تجربة تسجيل الدخول',
    description:
      'ابدأ بسرعة مع إعداد تسجيل الدخول الأول الخاص بك. يرشدك هذا الدليل خلال جميع الإعدادات اللازمة.',
    get_started: 'ابدأ',
    apply_remind: 'يرجى ملاحظة أن تجربة تسجيل الدخول ستنطبق على جميع التطبيقات تحت هذا الحساب.',
  },
  color: {
    title: 'اللون',
    primary_color: 'لون العلامة التجارية',
    dark_primary_color: 'لون العلامة التجارية (الداكن)',
    dark_mode: 'تمكين الوضع الداكن',
    dark_mode_description:
      'سيحتوي تطبيقك على نمط وضع داكن مولد تلقائيًا بناءً على لون العلامة التجارية الخاصة بك وخوارزمية Logto. يمكنك تخصيصه بحرية.',
    dark_mode_reset_tip: 'إعادة حساب لون الوضع الداكن بناءً على لون العلامة التجارية.',
    reset: 'إعادة الحساب',
  },
  branding: {
    title: 'منطقة العلامة التجارية',
    ui_style: 'النمط',
    with_light: '{{value}}',
    with_dark: '{{value}} (داكن)',
    app_logo_and_favicon: 'شعار التطبيق ورمز الموقع',
    company_logo_and_favicon: 'شعار الشركة ورمز الموقع',
    organization_logo_and_favicon: 'شعار المنظمة ورمز الموقع',
  },
  branding_uploads: {
    app_logo: {
      title: 'شعار التطبيق',
      url: 'رابط شعار التطبيق',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'شعار التطبيق: {{error}}',
    },
    company_logo: {
      title: 'شعار الشركة',
      url: 'رابط شعار الشركة',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'شعار الشركة: {{error}}',
    },
    organization_logo: {
      title: 'تحميل صورة',
      url: 'رابط شعار المنظمة',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'شعار المنظمة: {{error}}',
    },
    connector_logo: {
      title: 'تحميل صورة',
      url: 'رابط شعار الموصل',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'شعار الموصل: {{error}}',
    },
    favicon: {
      title: 'رمز الموقع',
      url: 'رابط رمز الموقع',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'رمز الموقع: {{error}}',
    },
  },
  custom_ui: {
    title: 'واجهة مخصصة',
    css_code_editor_title: 'CSS مخصص',
    css_code_editor_description1: 'انظر إلى مثال لـ CSS مخصص.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'تعلم المزيد',
    css_code_editor_content_placeholder:
      'أدخل CSS المخصص الخاص بك لتخصيص أنماط أي شيء وفقًا لمواصفاتك الدقيقة. اعبر عن إبداعك واجعل واجهة المستخدم الخاصة بك تبرز.',
    bring_your_ui_title: 'اجلب واجهتك الخاصة',
    bring_your_ui_description:
      'قم بتحميل حزمة مضغوطة (.zip) لاستبدال واجهة المستخدم المُعدة مسبقًا في Logto بالشفرة الخاصة بك. <a>تعلم المزيد</a>',
    preview_with_bring_your_ui_description:
      'تم تحميل أصول واجهة المستخدم المخصصة الخاصة بك بنجاح ويتم تقديمها الآن. وبالتالي ، تم تعطيل نافذة المعاينة المدمجة.\nلتجربة واجهة تسجيل الدخول المخصصة الخاصة بك ، انقر فوق زر "المعاينة المباشرة" لفتحها في علامة تبويب مستعرض جديدة.',
  },
  account_center: {
    title: 'مركز الحساب',
    description: 'خصص تدفقات مركز الحساب باستخدام واجهات Logto.',
    enable_account_api: 'تفعيل Account API',
    enable_account_api_description:
      'فعّل Account API لبناء مركز حساب مخصص ومنح المستخدمين وصولًا مباشرًا إلى الواجهات دون استخدام Logto Management API.',
    field_options: {
      off: 'Off',
      edit: 'Edit',
      read_only: 'Read only',
      enabled: 'مفعّل',
      disabled: 'معطّل',
    },
    sections: {
      account_security: {
        title: 'ACCOUNT SECURITY',
        description:
          'Manage access to the Account API, enabling users to view or edit their identity information and authentication factors after signing into the application. Users must verify their identity to get a valid 10-minute verification record ID before making these security-related changes.',
        groups: {
          identifiers: {
            title: 'Identifiers',
          },
          authentication_factors: {
            title: 'Authentication factors',
          },
        },
      },
      user_profile: {
        title: 'USER PROFILE',
        description:
          'Manage access to the Account API, enabling users to view or edit basic or custom profile data after signing into the application.',
        groups: {
          profile_data: {
            title: 'Profile data',
          },
        },
      },
      secret_vault: {
        title: 'خزنة الأسرار',
        description:
          'للموصلات الاجتماعية وموصلات المؤسسة، تخزين آمن لرموز الوصول الخاصة بالطرف الثالث لاستدعاء واجهاتهم البرمجية (على سبيل المثال، إضافة أحداث إلى تقويم Google).',
        third_party_token_storage: {
          title: 'رمز الطرف الثالث',
          third_party_access_token_retrieval: 'رمز الطرف الثالث',
          third_party_token_tooltip:
            'لتخزين الرموز، يمكنك تفعيل هذا في إعدادات الموصل الاجتماعي أو موصل المؤسسة المقابل.',
          third_party_token_description:
            'بمجرد تفعيل Account API، يتم تفعيل استرجاع رموز الطرف الثالث تلقائيًا.',
        },
      },
    },
    fields: {
      email: 'Email address',
      phone: 'Phone number',
      social: 'Social identities',
      password: 'Password',
      mfa: 'Multi-factor authentication',
      mfa_description: 'Let users manage their MFA methods from the account center.',
      username: 'Username',
      name: 'Name',
      avatar: 'Avatar',
      profile: 'Profile',
      profile_description: 'Control access to structured profile attributes.',
      custom_data: 'Custom data',
      custom_data_description: 'Control access to custom JSON data stored on the user.',
    },
    webauthn_related_origins: 'أصول WebAuthn ذات الصلة',
    webauthn_related_origins_description:
      'أضف نطاقات تطبيقات الواجهة الأمامية المسموح لها بتسجيل مفاتيح المرور عبر API الحساب.',
    webauthn_related_origins_error: 'يجب أن يبدأ الأصل بـ https:// أو http://',
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'لم يتم إعداد أي موصل SMS بعد. قبل إكمال التكوين ، لن يتمكن المستخدمون من تسجيل الدخول باستخدام هذه الطريقة. <a>{{link}}</a> في "الموصلات"',
    no_connector_email:
      'لم يتم إعداد أي موصل بريد إلكتروني بعد. قبل إكمال التكوين ، لن يتمكن المستخدمون من تسجيل الدخول باستخدام هذه الطريقة. <a>{{link}}</a> في "الموصلات"',
    no_connector_social:
      'لم تقم بإعداد أي موصل اجتماعي بعد. أضف الموصلات أولاً لتطبيق طرق تسجيل الدخول الاجتماعي. <a>{{link}}</a> في "الموصلات".',
    no_connector_email_account_center:
      'لم يتم إعداد موصل البريد الإلكتروني بعد. قم بالإعداد في <a>"موصلات البريد الإلكتروني والرسائل القصيرة"</a>.',
    no_connector_sms_account_center:
      'لم يتم إعداد موصل الرسائل القصيرة بعد. قم بالإعداد في <a>"موصلات البريد الإلكتروني والرسائل القصيرة"</a>.',
    no_connector_social_account_center:
      'لم يتم إعداد الموصل الاجتماعي بعد. قم بالإعداد في <a>"الموصلات الاجتماعية"</a>.',
    no_mfa_factor: 'لم يتم إعداد أي عامل MFA بعد. <a>{{link}}</a> في "المصادقة متعددة العوامل".',
    setup_link: 'إعداد',
  },
  save_alert: {
    description:
      'أنت تقوم بتنفيذ إجراءات تسجيل الدخول والتسجيل الجديدة. قد يتأثر جميع مستخدميك بالتغيير الجديد. هل أنت متأكد من الالتزام بالتغيير؟',
    before: 'قبل',
    after: 'بعد',
    sign_up: 'التسجيل',
    sign_in: 'تسجيل الدخول',
    social: 'اجتماعي',
    forgot_password_migration_notice:
      'لقد قمنا بترقية التحقق من كلمة المرور المنسية لدعم الطرق المخصصة. في السابق، كان هذا يتم تحديده تلقائياً بواسطة موصلات البريد الإلكتروني والرسائل القصيرة. انقر فوق <strong>تأكيد</strong> لإكمال الترقية.',
  },
  preview: {
    title: 'معاينة تسجيل الدخول',
    live_preview: 'معاينة مباشرة',
    live_preview_tip: 'حفظ لمعاينة التغييرات',
    native: 'التطبيق الأصلي',
    desktop_web: 'الويب على سطح المكتب',
    mobile_web: 'الويب على الهاتف المحمول',
    desktop: 'سطح المكتب',
    mobile: 'الهاتف المحمول',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
