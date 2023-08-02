const components = {
  uploader: {
    action_description: 'Trascina e rilascia o cerca',
    uploading: 'Caricamento in corso...',
    image_limit:
      'Carica immagini sotto i {{size, number}}KB, solo {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_upload: 'Qualcosa è andato storto. Caricamento fallito.',
    error_file_size: 'Il file è troppo grande. Carica un file sotto i {{size, number}}KB.',
    error_file_type:
      'Formato file non supportato. Sono accettati solo formati {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_file_count: 'Puoi caricare solo 1 file.',
  },
};

export default Object.freeze(components);
