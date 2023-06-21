const tenants = {
  create_modal: {
    title: 'Créer un locataire',
    subtitle: 'Créez un nouveau locataire pour séparer les ressources et les utilisateurs.',
    create_button: 'Créer un locataire',
    tenant_name_placeholder: 'Mon locataire',
  },
  delete_modal: {
    title: 'Supprimer le locataire',
    description_line1:
      'Voulez-vous vraiment supprimer votre locataire "<span>{{name}}</span>" avec le tag de suffixe d\'environnement "<span>{{tag}}</span>" ? Cette action est irréversible et entraînera la suppression permanente de toutes vos données et informations de compte.',
    description_line2:
      'Avant de supprimer le compte, peut-être pouvons-nous vous aider. <span><a>Contactez-nous par e-mail</a></span>',
    description_line3:
      'Si vous souhaitez continuer, veuillez entrer le nom du locataire "<span>{{name}}</span>" pour confirmer.',
    delete_button: 'Supprimer définitivement',
  },
  tenant_landing_page: {
    title: "Vous n'avez pas encore créé de locataire",
    description:
      "Pour commencer à configurer votre projet avec Logto, veuillez créer un nouveau locataire. Si vous devez vous déconnecter ou supprimer votre compte, cliquez simplement sur le bouton d'avatar dans le coin supérieur droit.",
    create_tenant_button: 'Créer un locataire',
  },
  tenant_created: "Locataire '{{name}}' créé avec succès.",
};

export default tenants;
