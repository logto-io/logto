const components = {
  uploader: {
    action_description: 'Sürükle ve bırak veya gözat',
    uploading: 'Yükleniyor...',
    image_limit:
      '{{size, number}}KB altındaki resimleri yükleyin, yalnızca {{extensions, list(style: narrow; type: conjunction;)}} dosyaları kabul edilir.',
    error_upload: 'Bir şeyler yanlış gitti. Dosya yüklenemedi.',
    error_file_size: 'Dosya boyutu çok büyük. Lütfen {{limitWithUnit}} altında bir dosya yükleyin.',
    error_file_type:
      'Dosya türü desteklenmiyor. Yalnızca {{extensions, list(style: narrow; type: conjunction;)}} dosyaları kabul edilir.',
    error_file_count: 'Sadece 1 dosya yükleyebilirsiniz.',
  },
};

export default Object.freeze(components);
