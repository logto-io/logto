const enterprise_sso = {
  page_title: "SSO d'entreprise",
  title: "SSO d'entreprise",
  subtitle:
    "Connectez le fournisseur d'identité de l'entreprise et activez la connexion unique initiée par le fournisseur de services.",
  create: "Ajouter un connecteur d'entreprise",
  col_connector_name: 'Nom du connecteur',
  col_type: 'Type',
  col_email_domain: 'Domaine de messagerie',
  col_status: 'Statut',
  col_status_in_use: 'Utilisé',
  col_status_invalid: 'Invalide',
  placeholder_title: "Connecteur d'entreprise",
  placeholder_description:
    "Logto a fourni de nombreux fournisseurs d'identité d'entreprise intégrés à connecter. Vous pouvez également créer le vôtre avec des protocoles standard.",
  create_modal: {
    title: "Ajouter un connecteur d'entreprise",
    text_divider: 'Ou vous pouvez personnaliser votre connecteur avec un protocole standard.',
    connector_name_field_title: 'Nom du connecteur',
    connector_name_field_placeholder: "Nom du fournisseur d'identité de l'entreprise",
    create_button_text: 'Créer un connecteur',
  },
};

export default Object.freeze(enterprise_sso);
