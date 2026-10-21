const storage = {
  not_configured: 'ارائه‌دهنده ذخیره‌سازی پیکربندی نشده است.',
  missing_parameter: 'پارامتر {{parameter}} برای ارائه‌دهنده ذخیره‌سازی وجود ندارد.',
  upload_error: 'آپلود فایل به ارائه‌دهنده ذخیره‌سازی ناموفق بود.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'آرشیو قابل خواندن نیست. یک فایل ZIP غیرخالی با Deflate یا بدون فشرده‌سازی بسازید و دوباره بارگذاری کنید.',
  custom_ui_file_too_large:
    'حجم فایل استخراج‌شده «{{name}}» باید کمتر از 10 MiB باشد. حجم فایل را کاهش دهید و دوباره بارگذاری کنید.',
  custom_ui_too_many_entries:
    'فایل ZIP شامل ورودی‌های بیش از حد مجاز است. حداکثر 200 فایل و پوشه در آن قرار دهید و دوباره بارگذاری کنید.',
};

export default Object.freeze(storage);
