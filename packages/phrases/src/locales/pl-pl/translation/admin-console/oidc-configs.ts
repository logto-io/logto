const oidc_configs = {
  sessions_card_title: 'Sesje Logto',
  sessions_card_description:
    'Dostosuj politykę sesji przechowywaną przez serwer autoryzacji Logto. Rejestruje ona globalny stan uwierzytelnienia użytkownika, aby umożliwić SSO i cichą ponowną autoryzację między aplikacjami.',
  session_max_ttl_in_days: 'Maksymalny czas życia sesji (TTL) w dniach',
  session_max_ttl_in_days_tip:
    'Bezwzględny limit czasu życia liczony od utworzenia sesji. Niezależnie od aktywności sesja kończy się po upływie tego stałego czasu.',
};

export default Object.freeze(oidc_configs);
