const password_rejected = {
  too_short: 'Die minimale Länge beträgt {{min}}.',
  too_long: 'Die maximale Länge beträgt {{max}}.',
  character_types: 'Mindestens {{min}} Arten von Zeichen sind erforderlich.',
  unsupported_characters: 'Nicht unterstütztes Zeichen gefunden.',
  pwned: 'Verwenden Sie keine einfachen Passwörter, die leicht zu erraten sind.',
  restricted_found: 'Vermeiden Sie übermäßigen Gebrauch von {{list, list}}.',
  'restricted.repetition': 'wiederholte Zeichen',
  'restricted.sequence': 'sequenzielle Zeichen',
  'restricted.user_info': 'Ihre persönlichen Informationen',
  'restricted.words': 'Produktkontext',
};

export default Object.freeze(password_rejected);
