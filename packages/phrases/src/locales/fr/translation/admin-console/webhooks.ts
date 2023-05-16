const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Les webhooks fournissent des mises à jour en temps réel sur des événements spécifiques à votre URL de point de terminaison, permettant des réactions immédiates.',
  create: 'Créer un webhook',
  events: {
    post_register: 'Nouveau compte créé',
    post_sign_in: 'Connectez-vous',
    post_reset_password: 'Réinitialiser le mot de passe',
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
      'Les webhooks fournissent des mises à jour en temps réel sur des événements spécifiques à votre URL de point de terminaison, permettant des réactions immédiates. Les événements de "Créer un compte, se connecter, réinitialiser un mot de passe" sont maintenant pris en charge.',
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
      "Entrez l'URL HTTPS de votre point de terminaison où la charge utile d'un webhook est envoyée lorsque l'événement se produit.",
    create_webhook: 'Créer un webhook',
    missing_event_error: 'Vous devez sélectionner au moins un événement.',
    https_format_error: 'Format HTTPS requis pour des raisons de sécurité.',
    block_description:
      "La version actuelle prend en charge jusqu'à trois webhooks. Si vous avez besoin de webhooks supplémentaires, veuillez envoyer un e-mail à notre équipe d'assistance <a>{{link}}</a> et nous serons heureux de vous aider.",
  },
  webhook_created: 'Le webhook {{name}} a été créé avec succès.',
};

export default webhooks;
