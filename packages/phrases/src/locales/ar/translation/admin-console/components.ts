const components = {
  uploader: {
    action_description: 'اسحب وأفلت أو تصفح',
    uploading: 'جاري التحميل...',
    image_limit:
      'قم بتحميل الصورة بحجم أقل من {{size, number}} كيلوبايت، {{extensions, list(style: narrow; type: conjunction;)}} فقط.',
    error_upload: 'حدث خطأ ما. فشل تحميل الملف.',
    error_file_size: 'حجم الملف كبير جدًا. يرجى تحميل ملف بحجم أقل من {{limitWithUnit}}.',
    error_file_type:
      'نوع الملف غير مدعوم. {{extensions, list(style: narrow; type: conjunction;)}} فقط.',
    error_file_count: 'يمكنك تحميل ملف واحد فقط.',
  },
};

export default Object.freeze(components);
