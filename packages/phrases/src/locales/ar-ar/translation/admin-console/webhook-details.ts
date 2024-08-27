const webhook_details = {
  page_title: 'تفاصيل الويب هوك',
  back_to_webhooks: 'العودة إلى الويب هوك',
  not_in_use: 'غير مستخدم',
  success_rate: 'معدل النجاح',
  requests: '{{value, number}} طلبات في 24 ساعة',
  disable_webhook: 'تعطيل الويب هوك',
  disable_reminder:
    'هل أنت متأكد أنك تريد إعادة تفعيل هذا الويب هوك؟ سيؤدي ذلك إلى عدم إرسال طلب HTTP إلى عنوان URL النهائي.',
  webhook_disabled: 'تم تعطيل الويب هوك.',
  webhook_reactivated: 'تم إعادة تفعيل الويب هوك.',
  reactivate_webhook: 'إعادة تفعيل الويب هوك',
  delete_webhook: 'حذف الويب هوك',
  deletion_reminder:
    'أنت تقوم بإزالة هذا الويب هوك. بعد الحذف، لن يتم إرسال طلب HTTP إلى عنوان URL النهائي.',
  deleted: 'تم حذف الويب هوك بنجاح.',
  settings_tab: 'الإعدادات',
  recent_requests_tab: 'الطلبات الأخيرة (24 ساعة)',
  settings: {
    settings: 'الإعدادات',
    settings_description:
      'تسمح لك الويب هوك بتلقي تحديثات فورية حول الأحداث المحددة عند حدوثها، من خلال إرسال طلب POST إلى عنوان URL النهائي الخاص بك. يتيح لك ذلك اتخاذ إجراءات فورية استنادًا إلى المعلومات الجديدة المستلمة.',
    events: 'الأحداث',
    events_description: 'حدد الأحداث المشغلة التي سترسل Logto طلب POST لها.',
    name: 'الاسم',
    endpoint_url: 'عنوان URL النهائي',
    signing_key: 'مفتاح التوقيع',
    signing_key_tip:
      'أضف المفتاح السري الذي يوفره Logto إلى عنوان URL الخاص بك كرأس طلب لضمان صحة حمولة الويب هوك.',
    regenerate: 'إعادة توليد',
    regenerate_key_title: 'إعادة توليد مفتاح التوقيع',
    regenerate_key_reminder:
      'هل أنت متأكد أنك تريد تعديل مفتاح التوقيع؟ ستكون إعادة توليدها سارية المفعول فورًا. يرجى تذكر تعديل مفتاح التوقيع بشكل متزامن في عنوان URL الخاص بك.',
    regenerated: 'تم إعادة توليد مفتاح التوقيع.',
    custom_headers: 'رؤوس مخصصة',
    custom_headers_tip:
      'اختياريًا، يمكنك إضافة رؤوس مخصصة إلى حمولة الويب هوك لتوفير سياق أو بيانات توضيحية إضافية حول الحدث.',
    key_duplicated_error: 'لا يمكن تكرار المفتاح.',
    key_missing_error: 'المفتاح مطلوب.',
    value_missing_error: 'القيمة مطلوبة.',
    invalid_key_error: 'المفتاح غير صالح',
    invalid_value_error: 'القيمة غير صالحة',
    test: 'اختبار',
    test_webhook: 'اختبار الويب هوك الخاص بك',
    test_webhook_description:
      'قم بتكوين الويب هوك واختبره باستخدام أمثلة لحمولة لكل حدث محدد للتحقق من استلام ومعالجة صحيحة.',
    send_test_payload: 'إرسال حمولة الاختبار',
    test_result: {
      endpoint_url: 'عنوان URL النهائي: {{url}}',
      message: 'الرسالة: {{message}}',
      response_status: 'حالة الاستجابة: {{status, number}}',
      response_body: 'جسم الاستجابة: {{body}}',
      request_time: 'وقت الطلب: {{time}}',
      test_success: 'تم اختبار الويب هوك بنجاح على العنوان النهائي.',
    },
  },
};

export default Object.freeze(webhook_details);
