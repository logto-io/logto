const api_resource_details = {
  page_title: 'API Resource details', // UNTRANSLATED
  back_to_api_resources: 'Retour aux ressources API',
  settings_tab: 'Paramètres',
  permissions_tab: 'Autorisations',
  settings: 'Paramètres',
  settings_description:
    "Les ressources API, également connues sous le nom d'indicateurs de ressource, indiquent les services ou les ressources cibles à demander, généralement une variable de format d'URI représentant l'identité de la ressource.",
  token_expiration_time_in_seconds: "Temps d'expiration du jeton (en secondes)",
  token_expiration_time_in_seconds_placeholder: "Entrez le délai d'expiration de votre jeton",
  delete_description:
    'Cette action ne peut pas être annulée. Elle supprimera définitivement la ressource API. Veuillez entrer le nom de la ressource API <span>{{name}}</span> pour confirmer.',
  enter_your_api_resource_name: 'Entrez le nom de votre ressource API',
  api_resource_deleted: 'La ressource API {{name}} a été supprimée avec succès',
  permission: {
    create_button: 'Créer une autorisation',
    create_title: 'Créer une autorisation',
    create_subtitle: 'Définir les autorisations (scopes) requises pour cette API.',
    confirm_create: 'Créer une autorisation',
    name: "Nom de l'autorisation",
    name_placeholder: 'read:resource',
    forbidden_space_in_name: "Le nom de l'autorisation ne doit pas contenir d'espaces.",
    description: 'Description',
    description_placeholder: 'Capable de lire les ressources',
    permission_created: "L'autorisation {{name}} a été créée avec succès",
    delete_description:
      "Si cette autorisation est supprimée, l'utilisateur qui avait cette autorisation perdra l'accès qui lui a été accordé.",
    deleted: 'L\'autorisation "{{name}}" a été supprimée avec succès !',
  },
};

export default api_resource_details;
