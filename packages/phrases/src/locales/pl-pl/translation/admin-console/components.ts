const components = {
  uploader: {
    action_description: 'Przeciągnij i upuść lub przeszukaj',
    uploading: 'Wysyłanie...',
    image_limit:
      'Wyślij obraz o rozmiarze mniejszym niż {{size, number}}KB, tylko w formacie {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_upload: 'Coś poszło nie tak. Nie udało się wysłać pliku.',
    error_file_size:
      'Plik jest zbyt duży. Wyślij plik o rozmiarze mniejszym niż {{size, number}}KB.',
    error_file_type:
      'Ten typ pliku nie jest obsługiwany. Obsługiwane formaty to {{extensions, list(style: narrow; type: conjunction;)}}.',
    error_file_count: 'Możesz przesłać tylko 1 plik.',
  },
};

export default Object.freeze(components);
