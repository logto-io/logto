const storage = {
  not_configured: 'O provedor de armazenamento não está configurado.',
  missing_parameter: 'Parâmetro {{parameter}} ausente para o provedor de armazenamento.',
  upload_error: 'Falha ao fazer upload do arquivo para o provedor de armazenamento.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'Não foi possível ler o arquivo. Crie um ZIP não vazio usando Deflate ou sem compressão e envie-o novamente.',
  custom_ui_file_too_large:
    'O arquivo extraído "{{name}}" deve ter menos de 10 MiB. Reduza o tamanho do arquivo e envie novamente.',
  custom_ui_too_many_entries:
    'O ZIP contém entradas demais. Inclua no máximo 200 arquivos e pastas no total e envie novamente.',
};

export default Object.freeze(storage);
