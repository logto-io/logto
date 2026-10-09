const storage = {
  not_configured: 'مزود التخزين غير مكون.',
  missing_parameter: 'معلمة مفقودة {{parameter}} لمزود التخزين.',
  upload_error: 'فشل في تحميل الملف إلى مزود التخزين.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip: 'تعذّرت قراءة الأرشيف. أنشئ ملف ZIP جديدًا غير فارغ وأعد تحميله.',
  custom_ui_file_too_large:
    'يجب أن يكون حجم كل ملف مستخرج أقل من 10 MiB. قلّل حجم الملف وأعد التحميل.',
  custom_ui_too_many_entries:
    'يحتوي ملف ZIP على عناصر كثيرة جدًا. ضمّن ما لا يزيد عن 200 ملف ومجلد وأعد التحميل.',
};

export default Object.freeze(storage);
