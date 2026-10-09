const storage = {
  not_configured: 'ストレージプロバイダが設定されていません。',
  missing_parameter: 'ストレージプロバイダの{{parameter}}が欠落しています。',
  upload_error: 'ファイルのアップロードに失敗しました。',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'アーカイブを読み取れませんでした。空でない ZIP ファイルを新しく作成し、再度アップロードしてください。',
  custom_ui_file_too_large:
    '展開後の各ファイルは 10 MiB 未満である必要があります。ファイルサイズを小さくして再度アップロードしてください。',
  custom_ui_too_many_entries:
    'ZIP 内のエントリが多すぎます。ファイルとフォルダーの合計を 200 個以下にして再度アップロードしてください。',
};

export default Object.freeze(storage);
