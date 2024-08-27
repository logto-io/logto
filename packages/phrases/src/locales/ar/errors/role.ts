const role = {
  name_in_use: 'اسم الدور {{name}} مستخدم بالفعل',
  scope_exists: 'تمت إضافة معرف النطاق {{scopeId}} بالفعل إلى هذا الدور',
  management_api_scopes_not_assignable_to_user_role:
    'لا يمكن تعيين نطاقات واجهة برمجة التطبيقات لإدارة الدور لدور المستخدم.',
  user_exists: 'تمت إضافة معرف المستخدم {{userId}} بالفعل إلى هذا الدور',
  application_exists: 'تمت إضافة معرف التطبيق {{applicationId}} بالفعل إلى هذا الدور',
  default_role_missing:
    'بعض أسماء الأدوار الافتراضية غير موجودة في قاعدة البيانات، يرجى التأكد من إنشاء الأدوار أولاً',
  internal_role_violation:
    'قد تحاول تحديث أو حذف دور داخلي ممنوع بواسطة Logto. إذا كنت تقوم بإنشاء دور جديد، جرب اسمًا آخر لا يبدأ بـ "#internal:".',
};

export default Object.freeze(role);
