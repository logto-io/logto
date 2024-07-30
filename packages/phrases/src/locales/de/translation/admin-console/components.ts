const components = {
  uploader: {
    action_description: 'Ziehen und Ablegen oder Datei auswählen',
    uploading: 'Wird hochgeladen...',
    image_limit:
      'Lade ein Bild unter {{size, number}}KB hoch, nur {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_upload: 'Etwas ist schiefgelaufen. Dateiupload fehlgeschlagen.',
    error_file_size: 'Dateigröße ist zu groß. Bitte lade eine Datei unter {{limitWithUnit}} hoch.',
    error_file_type:
      'Dateityp wird nicht unterstützt. Nur {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_file_count: 'Sie können nur 1 Datei hochladen.',
  },
};

export default Object.freeze(components);
