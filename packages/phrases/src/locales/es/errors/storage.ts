const storage = {
  not_configured: 'Proveedor de almacenamiento no está configurado.',
  missing_parameter: 'Falta el parámetro {{parameter}} para el proveedor de almacenamiento.',
  upload_error: 'Error al cargar el archivo al proveedor de almacenamiento.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'No se pudo leer el archivo. Crea un nuevo archivo ZIP que no esté vacío y vuelve a subirlo.',
  custom_ui_file_too_large:
    'Cada archivo extraído debe ocupar menos de 10 MiB. Reduce el tamaño del archivo y vuelve a subirlo.',
  custom_ui_too_many_entries:
    'El ZIP contiene demasiadas entradas. Incluye como máximo 200 archivos y carpetas y vuelve a subirlo.',
};

export default Object.freeze(storage);
