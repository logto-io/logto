const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Créez des webhooks pour recevoir sans effort des mises à jour en temps réel concernant des événements spécifiques.',
  create: 'Créer un webhook',
  schemas: {
    interaction: 'Interaction utilisateur',
    user: 'Utilisateur',
    organization: 'Organisation',
    role: 'Rôle',
    scope: 'Permission',
    organization_role: "Rôle de l'organisation",
    organization_scope: "Permission de l'organisation",
  },
  table: {
    name: 'Nom',
    events: 'Événements',
    success_rate: 'Taux de réussite (24 h)',
    requests: 'Demandes (24 h)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Créez un webhook pour recevoir des mises à jour en temps réel via des demandes POST vers l\'URL de votre point de terminaison. Restez informé et agissez immédiatement sur des événements tels que "Créer un compte", "Se connecter" et "Réinitialiser le mot de passe".',
    create_webhook: 'Créer un webhook',
  },
  create_form: {
    title: 'Créer un webhook',
    subtitle:
      "Ajoutez le webhook pour envoyer une demande POST à l'URL de point de terminaison avec les détails de tous les événements des utilisateurs.",
    events: 'Événements',
    events_description:
      'Sélectionnez les événements de déclenchement que Logto enverra la demande POST.',
    name: 'Nom',
    name_placeholder: 'Entrez le nom du webhook',
    endpoint_url: "URL du point d'extrémité",
    endpoint_url_placeholder: 'https://votre.url.de.webhook.point.de.terminaison',
    endpoint_url_tip:
      "Entrez l'URL de votre point de terminaison où la charge utile d'un webhook est envoyée lorsque l'événement se produit.",
    create_webhook: 'Créer un webhook',
    missing_event_error: 'Vous devez sélectionner au moins un événement.',
  },
  webhook_created: 'Le webhook {{name}} a été créé avec succès.',
};

export default Object.freeze(webhooks);
