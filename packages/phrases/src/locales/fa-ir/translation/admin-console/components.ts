const components = {
  uploader: {
    action_description: 'بکشید و رها کنید یا مرور کنید',
    uploading: 'در حال بارگذاری...',
    image_limit:
      'تصویر را زیر {{size, number}} کیلوبایت، فقط {{extensions, list(style: narrow; type: conjunction;)}} بارگذاری کنید.',
    error_upload: 'مشکلی پیش آمد. بارگذاری فایل ناموفق بود.',
    error_file_size: 'حجم فایل خیلی زیاد است. لطفاً فایلی زیر {{limitWithUnit}} بارگذاری کنید.',
    error_file_type:
      'نوع فایل پشتیبانی نمی‌شود. فقط {{extensions, list(style: narrow; type: conjunction;)}} مجاز است.',
    error_file_count: 'فقط می‌توانید ۱ فایل بارگذاری کنید.',
  },
};

export default Object.freeze(components);
