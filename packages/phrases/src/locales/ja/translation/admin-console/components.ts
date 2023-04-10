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
    error_file_count: 'You can only upload 1 file.', // UNTRANSLATED
  },
};

export default components;
