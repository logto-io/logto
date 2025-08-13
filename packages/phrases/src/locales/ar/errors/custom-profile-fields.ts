const custom_profile_fields = {
  entity_not_exists_with_names: 'تعذر العثور على الكيانات بالأسماء المقدمة: {{names}}',
  invalid_min_max_input: 'إدخال الحد الأدنى أو الأقصى غير صالح.',
  invalid_default_value: 'القيمة الافتراضية غير صالحة.',
  invalid_options: 'خيارات الحقل غير صالحة.',
  invalid_regex_format: 'تنسيق التعبير النمطي غير صالح.',
  invalid_address_parts: 'أجزاء العنوان غير صالحة.',
  invalid_fullname_parts: 'أجزاء الاسم الكامل غير صالحة.',
  invalid_sub_component_type: 'نوع المكوّن الفرعي غير صالح.',
  name_exists: 'هناك حقل بالفعل بهذا الاسم.',
  conflicted_sie_order: 'هناك تعارض في ترتيب الحقول لتجربة تسجيل الدخول.',
  invalid_name: 'اسم الحقل غير صالح ، يُسمح فقط بالأحرف أو الأرقام ، مع مراعاة حالة الأحرف.',
  name_conflict_sign_in_identifier:
    'اسم الحقل غير صالح. "{{name}}" هو مفتاح معرف تسجيل دخول محجوز.',
  name_conflict_built_in_prop:
    'اسم الحقل غير صالح. "{{name}}" هو خاصية ملف تعريف مستخدم مدمجة محجوزة.',
  name_conflict_custom_data: 'اسم الحقل غير صالح. "{{name}}" هو مفتاح بيانات مخصصة محجوز.',
  name_required: 'اسم الحقل مطلوب.',
};

export default Object.freeze(custom_profile_fields);
