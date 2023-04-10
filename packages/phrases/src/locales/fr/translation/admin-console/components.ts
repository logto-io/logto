const components = {
  uploader: {
    action_description: 'Glissez-déposez ou parcourez',
    uploading: 'Téléchargement...',
    image_limit:
      'Téléchargez une image de moins de {{size, number}} Ko, uniquement {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_upload: "Quelque chose s'est mal passé. La téléchargement de fichier a échoué.",
    error_file_size:
      'La taille du fichier est trop grande. Veuillez télécharger un fichier de moins de {{size, number}}Ko.',
    error_file_type:
      "Le type de fichier n'est pas pris en charge. Uniquement {{extensions, list(style: narrow; type: conjunction;)}}.",
    error_file_count: 'You can only upload 1 file.', // UNTRANSLATED
  },
};

export default components;
