const errors = {
  something_went_wrong: 'عفوًا! حدث خطأ ما.',
  page_not_found: 'الصفحة غير موجودة',
  unknown_server_error: 'حدث خطأ غير معروف في الخادم',
  empty: 'لا توجد بيانات',
  missing_total_number: 'تعذر العثور على "Total-Number" في رؤوس الاستجابة',
  invalid_uri_format: 'تنسيق عنوان URI غير صالح',
  invalid_origin_format: 'تنسيق أصل URI غير صالح',
  invalid_json_format: 'تنسيق JSON غير صالح',
  invalid_regex: 'تعبير عادي غير صالح',
  invalid_error_message_format: 'تنسيق رسالة الخطأ غير صالح.',
  required_field_missing: 'يرجى إدخال {{field}}',
  required_field_missing_plural: 'يجب عليك إدخال ما لا يقل عن {{field}} واحد',
  more_details: 'مزيد من التفاصيل',
  username_pattern_error:
    'يجب أن يحتوي اسم المستخدم فقط على الحروف والأرقام والشرطة السفلية ولا يجب أن يبدأ برقم.',
  email_pattern_error: 'عنوان البريد الإلكتروني غير صالح.',
  phone_pattern_error: 'رقم الهاتف غير صالح.',
  insecure_contexts: 'السياقات غير الآمنة (غير HTTPS) غير مدعومة.',
  unexpected_error: 'حدث خطأ غير متوقع.',
  not_found: '404 غير موجود',
  create_internal_role_violation:
    'أنت تقوم بإنشاء دور داخلي جديد وهذا ممنوع من قبل Logto. جرب اسمًا آخرًا لا يبدأ بـ "#internal:".',
  should_be_an_integer: 'يجب أن يكون عدد صحيح.',
  number_should_be_between_inclusive:
    'يجب أن يكون العدد بين {{min}} و {{max}} (شاملاً لكلا الحدود).',
};

export default Object.freeze(errors);
