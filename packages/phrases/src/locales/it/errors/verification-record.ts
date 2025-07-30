const verification_record = {
  not_found: 'Record di verifica non trovato.',
  permission_denied: 'Permesso negato, per favore riautenticati.',
  not_supported_for_google_one_tap: 'Questa API non supporta Google One Tap.',
  social_verification: {
    invalid_target: 'Record di verifica non valido. Previsto {{expected}}, ma ottenuto {{actual}}.',
    token_response_not_found:
      "Risposta del token non trovata. Controlla che l'archiviazione dei token sia supportata e abilitata per il connettore sociale.",
  },
};

export default Object.freeze(verification_record);
