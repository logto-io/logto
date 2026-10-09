const storage = {
  not_configured: "Le fournisseur de stockage n'est pas configuré.",
  missing_parameter: 'Paramètre manquant {{parameter}} pour le fournisseur de stockage.',
  upload_error: "Échec de l'envoi du fichier au fournisseur de stockage.",
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'Impossible de lire l’archive. Créez un nouveau fichier ZIP non vide et importez-le à nouveau.',
  custom_ui_file_too_large:
    'Chaque fichier extrait doit faire moins de 10 MiB. Réduisez la taille du fichier et réessayez.',
  custom_ui_too_many_entries:
    'Le ZIP contient trop d’entrées. Limitez-le à 200 fichiers et dossiers au total, puis réessayez.',
};

export default Object.freeze(storage);
