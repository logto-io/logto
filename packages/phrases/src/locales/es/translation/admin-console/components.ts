const components = {
  uploader: {
    action_description: 'Arrastra y suelta o busca',
    uploading: 'Subiendo...',
    image_limit:
      'Sube imágenes de menos de {{size, number}}KB, solo {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_upload: 'Algo salió mal. La subida de archivos falló.',
    error_file_size:
      'El archivo es demasiado grande. Por favor, sube un archivo de menos de {{size, number}}KB.',
    error_file_type:
      'El tipo de archivo no es compatible. Solo {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_file_count: 'Solo puedes subir 1 archivo.',
  },
};

export default Object.freeze(components);
