const storage = {
  not_configured: 'O provedor de armazenamento não está configurado.',
  missing_parameter: 'Faltando o parâmetro {{parameter}} para o provedor de armazenamento.',
  upload_error: 'Falha ao enviar o arquivo para o provedor de armazenamento.',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'Não foi possível ler o arquivo. Crie um novo ficheiro ZIP não vazio e carregue-o novamente.',
  custom_ui_file_too_large:
    'Cada ficheiro extraído deve ter menos de 10 MiB. Reduza o tamanho do ficheiro e carregue novamente.',
  custom_ui_too_many_entries:
    'O ZIP contém demasiadas entradas. Inclua no máximo 200 ficheiros e pastas no total e carregue novamente.',
};

export default Object.freeze(storage);
