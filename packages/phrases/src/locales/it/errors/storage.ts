const storage = {
  not_configured: 'Provider di archiviazione non configurato.',
  missing_parameter: 'Parametro mancante {{parameter}} per il provider di archiviazione.',
  upload_error: 'Impossibile caricare il file sul provider di archiviazione.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'Impossibile leggere l’archivio. Crea un file ZIP non vuoto con Deflate o senza compressione e caricalo di nuovo.',
  custom_ui_file_too_large:
    'Il file estratto "{{name}}" deve essere inferiore a 10 MiB. Riduci le dimensioni del file e riprova.',
  custom_ui_too_many_entries:
    'Il file ZIP contiene troppe voci. Includi al massimo 200 file e cartelle e riprova.',
};

export default Object.freeze(storage);
