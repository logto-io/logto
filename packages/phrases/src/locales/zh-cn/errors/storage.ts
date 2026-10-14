const storage = {
  not_configured: '未配置存储提供程序。',
  missing_parameter: '存储提供程序缺少参数 {{parameter}}。',
  upload_error: '无法将文件上传到存储提供程序。',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    '无法读取压缩包。请使用 Deflate 或不压缩方式创建一个非空的 ZIP 文件并重新上传。',
  custom_ui_file_too_large: '解压后的文件「{{name}}」必须小于 10 MiB。请减小文件大小后重新上传。',
  custom_ui_too_many_entries:
    'ZIP 压缩包中的条目过多。请将文件和文件夹的总数减少至 200 个以内后重新上传。',
};

export default Object.freeze(storage);
