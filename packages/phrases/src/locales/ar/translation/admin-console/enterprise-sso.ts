const enterprise_sso = {
  page_title: 'تسجيل الدخول الموحد للمؤسسة',
  title: 'تسجيل الدخول الموحد للمؤسسة',
  subtitle: 'قم بتوصيل موفر هوية المؤسسة وتمكين تسجيل الدخول الموحد بواسطة مزود الخدمة.',
  create: 'إضافة موصل المؤسسة',
  col_connector_name: 'اسم الموصل',
  col_type: 'النوع',
  col_email_domain: 'نطاق البريد الإلكتروني',
  placeholder_title: 'موصل المؤسسة',
  placeholder_description:
    'لقد قدمت Logto العديد من موفري هوية المؤسسة المدمجة للاتصال، في الوقت نفسه يمكنك إنشاء موفر خاص بك باستخدام بروتوكولات SAML و OIDC.',
  create_modal: {
    title: 'إضافة موصل المؤسسة',
    text_divider: 'أو يمكنك تخصيص الموصل الخاص بك باستخدام بروتوكول قياسي.',
    connector_name_field_title: 'اسم الموصل',
    connector_name_field_placeholder: 'على سبيل المثال، {اسم الشركة} - {اسم موفر الهوية}',
    create_button_text: 'إنشاء الموصل',
  },
  guide: {
    subtitle: 'دليل خطوة بخطوة لتوصيل موفر هوية المؤسسة.',
    finish_button_text: 'متابعة',
  },
  basic_info: {
    title: 'قم بتكوين الخدمة في موفر الهوية',
    description:
      'قم بإنشاء تكامل تطبيق جديد باستخدام SAML 2.0 في موفر الهوية {{name}} الخاص بك. ثم قم بلصق القيمة التالية فيه.',
    saml: {
      acs_url_field_name: 'عنوان URL لخدمة المستهلك للتأكيد (رد URL)',
      audience_uri_field_name: 'معرف الجمهور (معرف SP)',
    },
    oidc: {
      redirect_uri_field_name: 'عنوان URL لإعادة التوجيه (عنوان URL للرد)',
    },
  },
  attribute_mapping: {
    title: 'تعيين السمات',
    description:
      'السمات `id` و `email` مطلوبة لمزامنة ملف تعريف المستخدم من موفر الهوية. أدخل اسم الادعاء والقيمة التالية في موفر الهوية الخاص بك.',
    col_sp_claims: 'قيمة موفر الخدمة (Logto)',
    col_idp_claims: 'اسم الادعاء لموفر الهوية',
    idp_claim_tooltip: 'اسم الادعاء لموفر الهوية',
  },
  metadata: {
    title: 'قم بتكوين بيانات الموفر',
    description: 'قم بتكوين بيانات الموفر من موفر الهوية',
    dropdown_trigger_text: 'استخدم طريقة تكوين أخرى',
    dropdown_title: 'حدد طريقة التكوين الخاصة بك',
    metadata_format_url: 'أدخل عنوان URL للبيانات',
    metadata_format_xml: 'قم بتحميل ملف XML لبيانات الموفر',
    metadata_format_manual: 'أدخل تفاصيل البيانات يدويًا',
    saml: {
      metadata_url_field_name: 'عنوان URL للبيانات',
      metadata_url_description:
        'استرجع البيانات بشكل ديناميكي من عنوان URL للبيانات واحتفظ بالشهادة محدثة.',
      metadata_xml_field_name: 'ملف XML لبيانات موفر الهوية',
      metadata_xml_uploader_text: 'قم بتحميل ملف XML لبيانات الموفر',
      sign_in_endpoint_field_name: 'عنوان URL لتسجيل الدخول',
      idp_entity_id_field_name: 'معرف موفر الهوية (المُصدر)',
      certificate_field_name: 'شهادة التوقيع',
      certificate_placeholder: 'انسخ والصق شهادة x509',
      certificate_required: 'شهادة التوقيع مطلوبة.',
    },
    oidc: {
      client_id_field_name: 'معرف العميل',
      client_secret_field_name: 'السر الخاص بالعميل',
      issuer_field_name: 'المُصدر',
      scope_field_name: 'النطاق',
    },
  },
};

export default Object.freeze(enterprise_sso);
