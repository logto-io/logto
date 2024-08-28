const components = {
  uploader: {
    action_description: '拖放或浏览上传',
    uploading: '上传中...',
    image_limit:
      '上传图片大小不能超过 {{size, number}}KB，只支持 {{extensions, list(style: narrow; type: conjunction;)}} 格式的文件。',
    error_upload: '哎呀，出了些问题。文件上传失败。',
    error_file_size: '文件太大了，请上传小于 {{size, number}}KB 的文件。',
    error_file_type:
      '不支持该文件类型。只支持 {{extensions, list(style: narrow; type: conjunction;)}} 格式的文件。',
    error_file_count: '只能上传一个文件。',
  },
};

export default Object.freeze(components);
