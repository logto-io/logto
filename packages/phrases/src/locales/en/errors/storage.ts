const storage = {
  not_configured: 'Storage provider is not configured.',
  missing_parameter: 'Missing parameter {{parameter}} for storage provider.',
  upload_error: 'Failed to upload file to the storage provider.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'The archive could not be read. Create a new, non-empty ZIP file and upload it again.',
  custom_ui_file_too_large:
    'Each extracted file must be smaller than 10 MiB. Reduce the file size and upload again.',
  custom_ui_too_many_entries:
    'The ZIP contains too many entries. Include no more than 200 files and folders and upload again.',
};

export default Object.freeze(storage);
