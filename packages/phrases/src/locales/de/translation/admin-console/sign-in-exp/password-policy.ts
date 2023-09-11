const password_policy = {
  password_requirements: 'Passwortanforderungen',
  minimum_length: 'Mindestlänge',
  minimum_length_description:
    'NIST schlägt vor, <a>mindestens 8 Zeichen</a> für Webprodukte zu verwenden.',
  minimum_length_error: 'Die Mindestlänge muss zwischen {{min}} und {{max}} (einschließlich) sein.',
  minimum_required_char_types: 'Mindestanzahl erforderlicher Zeichentypen',
  minimum_required_char_types_description:
    'Zeichentypen: Großbuchstaben (A-Z), Kleinbuchstaben (a-z), Zahlen (0-9) und Sonderzeichen ({{symbols}}).',
  password_rejection: 'Passwortablehnung',
  compromised_passwords: 'Abgelehnte Passwörter',
  breached_passwords: 'Verletzte Passwörter',
  breached_passwords_description:
    'Ablehnung von zuvor in den Verletzungsdatenbanken gefundenen Passwörtern.',
  restricted_phrases: 'Einschränkung niedrigsicherer Phrasen',
  restricted_phrases_tooltip:
    'Ihr Passwort sollte diese Phrasen vermeiden, es sei denn, Sie kombinieren sie mit 3 oder mehr zusätzlichen Zeichen.',
  repetitive_or_sequential_characters: 'Wiederholte oder aufeinanderfolgende Zeichen',
  repetitive_or_sequential_characters_description: 'Zum Beispiel "AAAA", "1234" und "abcd".',
  user_information: 'Benutzerinformationen',
  user_information_description: 'Zum Beispiel E-Mail-Adresse, Telefonnummer, Benutzername, etc.',
  custom_words: 'Benutzerdefinierte Wörter',
  custom_words_description:
    'Personalisierte kontextspezifische Wörter, Groß-/Kleinschreibung wird nicht beachtet, ein Wort pro Zeile.',
  custom_words_placeholder: 'Name Ihres Dienstes, Firmenname, etc.',
};

export default Object.freeze(password_policy);
