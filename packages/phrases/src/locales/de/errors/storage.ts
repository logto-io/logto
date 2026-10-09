const storage = {
  not_configured: 'Der Storage-Anbieter ist nicht konfiguriert.',
  missing_parameter: 'Fehlender Parameter {{parameter}} für den Storage-Anbieter.',
  upload_error: 'Das Hochladen der Datei zum Storage-Anbieter ist fehlgeschlagen.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'Das Archiv konnte nicht gelesen werden. Erstelle eine neue, nicht leere ZIP-Datei und lade sie erneut hoch.',
  custom_ui_file_too_large:
    'Jede entpackte Datei muss kleiner als 10 MiB sein. Verringere die Dateigröße und lade die ZIP-Datei erneut hoch.',
  custom_ui_too_many_entries:
    'Die ZIP-Datei enthält zu viele Einträge. Beschränke sie auf höchstens 200 Dateien und Ordner und lade sie erneut hoch.',
};

export default Object.freeze(storage);
