const oidc_configs = {
  sessions_card_title: 'Sesje Logto',
  sessions_card_description:
    'Dostosuj politykę sesji przechowywaną przez serwer autoryzacji Logto. Rejestruje ona globalny stan uwierzytelnienia użytkownika, aby umożliwić SSO i cichą ponowną autoryzację między aplikacjami.',
  session_max_ttl_in_days: 'Maksymalny czas życia sesji (TTL) w dniach',
  session_max_ttl_in_days_tip:
    'Bezwzględny limit czasu życia liczony od utworzenia sesji. Niezależnie od aktywności sesja kończy się po upływie tego stałego czasu.',
  oss_notice:
    'W Logto OSS po każdej aktualizacji konfiguracji OIDC (w tym ustawień sesji i <keyRotationsLink>rotacji kluczy</keyRotationsLink>) uruchom ponownie instancję, aby zastosować zmiany. Aby automatycznie stosować wszystkie aktualizacje konfiguracji OIDC bez restartu usługi, <centralCacheLink>włącz centralny cache</centralCacheLink>.',
  cloud_private_key_rotation_notice:
    'W Logto Cloud rotacja klucza prywatnego zaczyna obowiązywać po 4-godzinnym okresie karencji.',
};

export default Object.freeze(oidc_configs);
