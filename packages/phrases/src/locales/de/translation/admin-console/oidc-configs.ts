const oidc_configs = {
  sessions_card_title: 'Logto-Sitzungen',
  sessions_card_description:
    'Passen Sie die vom Logto-Autorisierungsserver gespeicherte Sitzungsrichtlinie an. Sie zeichnet den globalen Authentifizierungsstatus des Benutzers auf, um SSO zu ermöglichen und eine stille erneute Authentifizierung über Apps hinweg zu unterstützen.',
  session_max_ttl_in_days: 'Sitzung maximale Lebensdauer (TTL) in Tagen',
  session_max_ttl_in_days_tip:
    'Eine absolute Lebensdauergrenze ab Erstellung der Sitzung. Unabhängig von Aktivitäten endet die Sitzung, sobald diese feste Dauer abläuft.',
};

export default Object.freeze(oidc_configs);
