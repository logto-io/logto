const api_resource_details = {
  back_to_api_resources: 'Retour aux ressources API',
  settings_tab: 'Settings', // UNTRANSLATED
  permission_tab: 'Permission', // UNTRANSLATED
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'API resources, a.k.a. Resource Indicators, indicate the target services or resources to be requested, usually, a URI format variable representing the resource‘s identity.', // UNTRANSLATED
  token_expiration_time_in_seconds: "Temps d'expiration du jeton (en secondes)",
  token_expiration_time_in_seconds_placeholder: "Entrez le délai d'expiration de votre jeton",
  delete_description:
    'Cette action ne peut pas être annulée. Elle supprimera définitivement la ressource API. Veuillez entrer le nom de la ressource API <span>{{name}}</span> pour confirmer.',
  enter_your_api_resource_name: 'Entrez le nom de votre ressource API',
  api_resource_deleted: 'La ressource API {{name}} a été supprimée avec succès',
  permission: {
    create_button: 'Create Permission', // UNTRANSLATED
    create_title: 'Create permission', // UNTRANSLATED
    create_subtitle: 'Define the permissions (scopes) needed by this API.', // UNTRANSLATED
    confirm_create: 'Create permission', // UNTRANSLATED
    name: 'Permission name', // UNTRANSLATED
    name_placeholder: 'Read: Resources', // UNTRANSLATED
    description: 'Description', // UNTRANSLATED
    description_placeholder: 'Able to read the resources', // UNTRANSLATED
    permission_created: 'The permission {{name}} has been successfully created', // UNTRANSLATED
    delete_description:
      'If this permission is deleted, the user who had this permission will lose the access granted by it.', // UNTRANSLATED
    deleted: 'The permission {{name}} has been successfully deleted', // UNTRANSLATED
  },
};

export default api_resource_details;
