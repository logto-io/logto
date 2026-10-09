const storage = {
  not_configured: '未配置存儲提供程序。',
  missing_parameter: '存儲提供程序缺少參數 {{parameter}}。',
  upload_error: '無法將檔案上傳到存儲提供程序。',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip: '無法讀取壓縮檔。請重新建立一個非空的 ZIP 檔案並上傳。',
  custom_ui_file_too_large: '解壓縮後的每個檔案必須小於 10 MiB。請縮小檔案後重新上傳。',
  custom_ui_too_many_entries:
    'ZIP 壓縮檔中的項目過多。請將檔案和資料夾的總數減至最多 200 個後重新上傳。',
};

export default Object.freeze(storage);
