const hook = {
  missing_events: 'Vous devez fournir au moins un événement.',
  send_test_payload_failed: "Échec de l'envoi de la charge utile de test : {{message}}",
  endpoint_responded_with_error: 'Le point de terminaison a répondu avec une erreur.',
  disabled: 'Le hook est désactivé et ne peut pas relivrer les événements.',
  log_not_permanently_failed:
    'Seules les livraisons de webhook ayant échoué définitivement peuvent être relivrées.',
  invalid_log_payload:
    "L'entrée du journal de webhook ne contient pas de charge utile de requête valide à relivrer.",
  redelivery_in_progress:
    'Une livraison ou une relivraison pour cet événement de webhook est déjà en cours.',
};

export default Object.freeze(hook);
