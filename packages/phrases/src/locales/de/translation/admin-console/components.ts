const components = {
  uploader: {
    action_description: 'Ziehen und Ablegen oder Datei auswählen',
    uploading: 'Wird hochgeladen...',
    error_upload: 'Etwas ist schiefgelaufen. Dateiupload fehlgeschlagen.',
    error_file_size: 'Dateigröße ist zu groß. Bitte lade eine Datei unter {{size, number}}KB hoch.',
    error_file_type:
      'Dateityp wird nicht unterstützt. Nur {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_file_count: 'Sie können nur 1 Datei hochladen.',
  },
};

export default Object.freeze(components);
