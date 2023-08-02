const components = {
  uploader: {
    action_description: 'ドラッグアンドドロップまたはブラウズ',
    uploading: 'アップロード中...',
    image_limit:
      '{{size, number}}KB以下のイメージをアップロードし、{{extensions, list(style: narrow; type: conjunction;)}}のみ許可します。',
    error_upload: 'エラーが発生しました。ファイルのアップロードに失敗しました。',
    error_file_size: '{{size, number}}KB以下のファイルをアップロードしてください。',
    error_file_type:
      '{{extensions, list(style: narrow; type: conjunction;)}}のみサポートされます。',
    error_file_count: '1つのファイルしかアップロードできません。',
  },
};

export default Object.freeze(components);
