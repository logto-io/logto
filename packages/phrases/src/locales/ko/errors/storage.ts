const storage = {
  not_configured: '저장소 공급자가 구성되지 않았습니다.',
  missing_parameter: '저장소 공급자에 대한 누락된 매개변수 {{parameter}}.',
  upload_error: '파일을 저장소 공급자에 업로드하지 못했습니다.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    '압축 파일을 읽을 수 없습니다. Deflate 또는 무압축 방식으로 비어 있지 않은 ZIP 파일을 만들어 다시 업로드하세요.',
  custom_ui_file_too_large:
    '압축 해제된 파일 "{{name}}"은(는) 10 MiB 미만이어야 합니다. 파일 크기를 줄인 후 다시 업로드하세요.',
  custom_ui_too_many_entries:
    'ZIP에 항목이 너무 많습니다. 파일과 폴더를 합쳐 200개 이하로 줄인 후 다시 업로드하세요.',
};

export default Object.freeze(storage);
