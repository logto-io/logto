const webhooks = {
  page_title: 'الويب هوك',
  title: 'الويب هوك',
  subtitle: 'إنشاء ويب هوك لتلقي تحديثات فورية في الوقت الحقيقي بخصوص الأحداث المحددة.',
  create: 'إنشاء ويب هوك',
  schemas: {
    interaction: 'تفاعل المستخدم',
    user: 'المستخدم',
    organization: 'المؤسسة',
    role: 'الدور',
    scope: 'الصلاحية',
    organization_role: 'دور المؤسسة',
    organization_scope: 'صلاحية المؤسسة',
  },
  table: {
    name: 'الاسم',
    events: 'الأحداث',
    success_rate: 'معدل النجاح (24 ساعة)',
    requests: 'الطلبات (24 ساعة)',
  },
  placeholder: {
    title: 'ويب هوك',
    description:
      'إنشاء ويب هوك لتلقي تحديثات فورية من خلال طلبات POST إلى عنوان URL الخاص بك. ابقَ على اطلاع وتخذ الإجراءات الفورية في الأحداث مثل "إنشاء حساب" و "تسجيل الدخول" و "إعادة تعيين كلمة المرور".',
    create_webhook: 'إنشاء ويب هوك',
  },
  create_form: {
    title: 'إنشاء ويب هوك',
    subtitle: 'أضف الويب هوك لإرسال طلب POST إلى عنوان URL الخاص بك مع تفاصيل أحداث المستخدمين.',
    events: 'الأحداث',
    events_description: 'حدد أحداث التشغيل التي سترسلها Logto كطلب POST.',
    name: 'الاسم',
    name_placeholder: 'أدخل اسم الويب هوك',
    endpoint_url: 'عنوان URL النهاية',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip: 'أدخل عنوان URL الخاص بك حيث يتم إرسال بيانات الويب هوك عند حدوث الحدث.',
    create_webhook: 'إنشاء ويب هوك',
    missing_event_error: 'يجب عليك تحديد حدث واحد على الأقل.',
  },
  webhook_created: 'تم إنشاء الويب هوك {{name}} بنجاح.',
};

export default Object.freeze(webhooks);
