const components = {
  uploader: {
    action_description: 'Arraste e solte ou procure',
    uploading: 'Enviando...',
    image_limit:
      'Carregue imagens abaixo de {{size, number}}KB, apenas {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_upload: 'Algo deu errado. Falha ao enviar arquivo.',
    error_file_size:
      'Tamanho do arquivo é muito grande. Por favor, envie um arquivo abaixo de {{size, number}}KB.',
    error_file_type:
      'Tipo de arquivo não é suportado. Apenas {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_file_count: 'Você só pode enviar 1 arquivo.',
  },
};

export default Object.freeze(components);
