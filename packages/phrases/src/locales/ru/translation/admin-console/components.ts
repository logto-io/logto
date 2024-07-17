const components = {
  uploader: {
    action_description: 'Перетащите или выберите файл',
    uploading: 'Загрузка...',
    image_limit:
      'Загрузите изображение размером менее {{size, number}} КБ, только {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_upload: 'Что-то пошло не так. Загрузка файла не удалась.',
    error_file_size:
      'Размер файла слишком большой. Пожалуйста, загрузите файл размером менее {{limitWithUnit}}.',
    error_file_type:
      'Тип файла не поддерживается. Допустимы только файлы типа {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_file_count: 'Вы можете загрузить только 1 файл.',
  },
};

export default Object.freeze(components);
