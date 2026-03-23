const concurrent_device_limit = {
  title: "Limite d'appareils simultanés",
  description:
    "Contrôle le nombre d'appareils sur lesquels chaque utilisateur peut rester connecté pour cette application.",
  enable: "Activer la limite d'appareils simultanés",
  enable_description:
    "Lorsqu'elle est activée, Logto applique le maximum de sessions actives par utilisateur pour cette application.",
  field: "Limite d'appareils simultanés par application",
  field_description:
    "Limitez le nombre d'appareils sur lesquels un utilisateur peut être connecté en même temps. Logto applique cette limite en limitant les sessions actives et révoque automatiquement la session la plus ancienne lorsque la limite est dépassée.",
  field_placeholder: 'Laisser vide pour ne pas limiter',
  should_be_greater_than_zero: 'Doit être supérieur à 0.',
};

export default Object.freeze(concurrent_device_limit);
