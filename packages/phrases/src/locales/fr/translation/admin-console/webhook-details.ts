const webhook_details = {
  page_title: 'Détails du webhook',
  back_to_webhooks: 'Retour aux webhooks',
  not_in_use: "Pas en cours d'utilisation",
  success_rate: 'Taux de réussite',
  requests: '{{value, number}} requêtes en 24h',
  disable_webhook: 'Désactiver le webhook',
  disable_reminder:
    "Êtes-vous sûr de vouloir réactiver ce webhook? Ceci n'enverra pas de requête HTTP à l'URL de l'endpoint.",
  webhook_disabled: 'Le webhook a été désactivé.',
  webhook_reactivated: 'Le webhook a été réactivé.',
  reactivate_webhook: 'Réactiver le webhook',
  delete_webhook: 'Supprimer le webhook',
  deletion_reminder:
    "Vous êtes en train de supprimer ce webhook. Après suppression, il n'enverra plus de requête HTTP à l'endpoint URL.",
  deleted: 'Le webhook a été supprimé avec succès.',
  settings_tab: 'Paramètres',
  recent_requests_tab: 'Demandes récentes (24 h)',
  settings: {
    settings: 'Paramètres',
    settings_description:
      "Les webhooks vous permettent de recevoir des mises à jour en temps réel sur des événements spécifiques, en envoyant une requête POST à l'URL de votre endpoint. Cela vous permet de prendre des actions immédiatement en fonction des nouvelles informations reçues.",
    events: 'Événements',
    events_description:
      'Sélectionnez les événements déclencheurs que Logto enverra la requête POST.',
    name: 'Nom',
    endpoint_url: "URL de l'endpoint",
    signing_key: 'Clé de signature',
    signing_key_tip:
      "Ajoutez la clé secrète fournie par Logto à votre endpoint en tant qu'en-tête de requête pour garantir l'authenticité de la charge utile du webhook.",
    regenerate: 'Régénérer',
    regenerate_key_title: 'Régénérer la clé de signature',
    regenerate_key_reminder:
      "Êtes-vous sûr de vouloir modifier la clé de signature? La régénération sera effective immédiatement. N'oubliez pas de modifier la clé de signature synchroniquement dans votre endpoint.",
    regenerated: 'La clé de signature a été régénérée.',
    custom_headers: 'En-têtes personnalisés',
    custom_headers_tip:
      "Optionnellement, vous pouvez ajouter des en-têtes personnalisés à la charge utile du webhook pour fournir un contexte ou des métadonnées supplémentaires sur l'événement.",
    key_duplicated_error: 'Les clés ne peuvent pas se répéter.',
    key_missing_error: 'La clé est requise.',
    value_missing_error: 'La valeur est requise.',
    invalid_key_error: 'Clé invalide',
    invalid_value_error: 'La valeur est invalide',
    test: 'Tester',
    test_webhook: 'Tester votre webhook',
    test_webhook_description:
      'Configurez le webhook, et testez-le avec des exemples de payload pour chaque événement sélectionné pour vérifier la réception et le traitement corrects.',
    send_test_payload: 'Envoyer une charge utile de test',
    test_result: {
      endpoint_url: 'URL du point de terminaison : {{url}}',
      message: 'Message : {{message}}',
      response_status: 'Statut de la réponse : {{status, number}}',
      response_body: 'Corps de la réponse : {{body}}',
      request_time: 'Temps de la demande : {{time}}',
      test_success: 'Le test du webhook vers le point de terminaison a réussi.',
    },
  },
};

export default Object.freeze(webhook_details);
