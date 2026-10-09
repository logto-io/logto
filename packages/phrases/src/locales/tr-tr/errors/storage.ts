const storage = {
  not_configured: 'Depolama sağlayıcısı yapılandırılmamış.',
  missing_parameter: 'Depolama sağlayıcısı için eksik parametre {{parameter}}.',
  upload_error: 'Dosya yüklenemedi.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'Arşiv okunamadı. Boş olmayan yeni bir ZIP dosyası oluşturup tekrar yükleyin.',
  custom_ui_file_too_large:
    'Çıkarılan her dosya 10 MiB boyutundan küçük olmalıdır. Dosya boyutunu küçültüp tekrar yükleyin.',
  custom_ui_too_many_entries:
    'ZIP çok fazla öğe içeriyor. Toplamda en fazla 200 dosya ve klasör ekleyip tekrar yükleyin.',
};

export default Object.freeze(storage);
