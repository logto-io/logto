import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'تجربة تسجيل الدخول',
  title: 'تجربة تسجيل الدخول',
  description: 'قم بتخصيص واجهة تسجيل الدخول لتتناسب مع علامتك التجارية وعرضها في الوقت الحقيقي',
  tabs: {
    branding: 'العلامة التجارية',
    sign_up_and_sign_in: 'التسجيل وتسجيل الدخول',
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
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'لم يتم إعداد أي موصل SMS بعد. قبل إكمال التكوين ، لن يتمكن المستخدمون من تسجيل الدخول باستخدام هذه الطريقة. <a>{{link}}</a> في "الموصلات"',
    no_connector_email:
      'لم يتم إعداد أي موصل بريد إلكتروني بعد. قبل إكمال التكوين ، لن يتمكن المستخدمون من تسجيل الدخول باستخدام هذه الطريقة. <a>{{link}}</a> في "الموصلات"',
    no_connector_social:
      'لم تقم بإعداد أي موصل اجتماعي بعد. أضف الموصلات أولاً لتطبيق طرق تسجيل الدخول الاجتماعي. <a>{{link}}</a> في "الموصلات".',
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
};

export default Object.freeze(sign_in_exp);
