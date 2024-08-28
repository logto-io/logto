const components = {
  uploader: {
    action_description: '拖放或瀏覽上傳',
    uploading: '上傳中...',
    image_limit:
      '上傳圖片大小不能超過 {{size, number}}KB，只支持 {{extensions, list(style: narrow; type: conjunction;)}} 格式的文件。',
    error_upload: '哎呀，出了些問題。文件上傳失敗。',
    error_file_size: '文件太大了，請上傳小於 {{size, number}}KB 的文件。',
    error_file_type:
      '不支持該文件類型。只支持 {{extensions, list(style: narrow; type: conjunction;)}} 格式的文件。',
    error_file_count: '您只能上傳一個檔案。',
  },
};

export default Object.freeze(components);
