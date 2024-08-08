const entity = {
  invalid_input: 'إدخال غير صالح. يجب ألا يكون قائمة القيم فارغة.',
  create_failed: 'فشل في إنشاء {{name}}.',
  db_constraint_violated: 'انتهاك قيد قاعدة البيانات.',
  not_exists: 'لا يوجد {{name}}.',
  not_exists_with_id: 'لا يوجد {{name}} بالمعرف `{{id}}`.',
  not_found: 'المورد غير موجود.',
  relation_foreign_key_not_found:
    'لا يمكن العثور على مفتاح أجنبي واحد أو أكثر. يرجى التحقق من الإدخال والتأكد من وجود جميع الكيانات المشار إليها.',
  unique_integrity_violation: 'الكيان موجود بالفعل. يرجى التحقق من الإدخال والمحاولة مرة أخرى.',
};

export default Object.freeze(entity);
