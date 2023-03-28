const components = {
  uploader: {
    action_description: 'ドラッグアンドドロップまたはブラウズ', // UNTRANSLATED
    uploading: 'アップロード中...', // UNTRANSLATED
    image_limit:
      '{{size, number}}KB以下のイメージをアップロードし、{{extensions, list(style: narrow; type: conjunction;)}}のみ許可します。', // UNTRANSLATED
    error_upload: 'エラーが発生しました。ファイルのアップロードに失敗しました。', // UNTRANSLATED
    error_file_size: '{{size, number}}KB以下のファイルをアップロードしてください。', // UNTRANSLATED
    error_file_type:
      '{{extensions, list(style: narrow; type: conjunction;)}}のみサポートされます。', // UNTRANSLATED
  },
};

export default components;
