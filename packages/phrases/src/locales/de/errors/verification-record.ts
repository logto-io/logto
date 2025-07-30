const verification_record = {
  not_found: 'Verifizierungsdatensatz nicht gefunden.',
  permission_denied: 'Zugriff verweigert, bitte erneut authentifizieren.',
  not_supported_for_google_one_tap: 'Diese API unterstützt Google One Tap nicht.',
  social_verification: {
    invalid_target:
      'Ungültiger Verifizierungsdatensatz. Erwartet {{expected}} , aber {{actual}} erhalten.',
    token_response_not_found:
      'Token-Antwort nicht gefunden. Bitte prüfen, ob die Token-Speicherung für den sozialen Connector unterstützt und aktiviert ist.',
  },
};

export default Object.freeze(verification_record);
