const storage = {
  not_configured: 'Nie skonfigurowano dostawcy magazynu.',
  missing_parameter: 'Brak parametru {{parameter}} dla dostawcy magazynu.',
  upload_error: 'Nie udało się przesłać pliku do dostawcy magazynu.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'Nie można odczytać archiwum. Utwórz nowy, niepusty plik ZIP i prześlij go ponownie.',
  custom_ui_file_too_large:
    'Każdy rozpakowany plik musi mieć mniej niż 10 MiB. Zmniejsz rozmiar pliku i prześlij ponownie.',
  custom_ui_too_many_entries:
    'Archiwum ZIP zawiera zbyt wiele elementów. Ogranicz ich liczbę do łącznie 200 plików i folderów i prześlij ponownie.',
};

export default Object.freeze(storage);
