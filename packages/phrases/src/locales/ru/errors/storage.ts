const storage = {
  not_configured: 'Провайдер хранилища не настроен.',
  missing_parameter: 'Отсутствует параметр {{parameter}} для провайдера хранилища.',
  upload_error: 'Не удалось загрузить файл в провайдер хранилища.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'Не удалось прочитать архив. Создайте новый непустой ZIP-файл и загрузите его снова.',
  custom_ui_file_too_large:
    'Каждый распакованный файл должен быть меньше 10 MiB. Уменьшите размер файла и повторите загрузку.',
  custom_ui_too_many_entries:
    'В ZIP-архиве слишком много элементов. Оставьте не более 200 файлов и папок суммарно и повторите загрузку.',
};

export default Object.freeze(storage);
