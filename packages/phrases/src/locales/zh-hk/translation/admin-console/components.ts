const components = {
  uploader: {
    action_description: '拖放或瀏覽上傳',
    uploading: '上傳中...',
    image_limit:
      '上傳圖片大小不能超過 {{size, number}}KB，只支援 {{extensions, list(style: narrow; type: conjunction;)}} 格式的檔案。',
    error_upload: '哎呀，出了些問題。檔案上傳失敗。',
    error_file_size: '檔案太大了，請上傳小於 {{size, number}}KB 的檔案。',
    error_file_type:
      '不支援該檔案格式，只支援 {{extensions, list(style: narrow; type: conjunction;)}} 格式的檔案。',
    error_file_count: '你只能上載一個檔案。',
  },
};

export default Object.freeze(components);
