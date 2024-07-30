const components = {
  uploader: {
    action_description: 'Arraste e solte ou navegue',
    uploading: 'A enviar...',
    image_limit:
      'Carregue imagens com menos de {{size, number}}KB, só {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_upload: 'Algo correu mal. O carregamento do ficheiro falhou.',
    error_file_size:
      'O ficheiro é demasiado grande. Por favor carregue um ficheiro com menos de {{limitWithUnit}}.',
    error_file_type:
      'O tipo de ficheiro não é suportado. Apenas {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_file_count: 'Só é possível carregar 1 ficheiro.',
  },
};

export default Object.freeze(components);
