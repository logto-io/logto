const password_policy = {
  password_requirements: 'Passwortanforderungen',
  minimum_length: 'Mindestlänge',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: 'Die Mindestlänge muss zwischen {{min}} und {{max}} (einschließlich) sein.',
  minimum_required_char_types: 'Mindestanzahl erforderlicher Zeichentypen',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: 'Passwortablehnung',
  compromised_passwords: 'Abgelehnte Passwörter',
  breached_passwords: 'Verletzte Passwörter',
  breached_passwords_description:
    'Ablehnung von zuvor in den Verletzungsdatenbanken gefundenen Passwörtern.',
  restricted_phrases: 'Einschränkung niedrigsicherer Phrasen',
  restricted_phrases_tooltip:
    'Benutzer dürfen keine Passwörter verwenden, die genau den unten aufgeführten Phrasen entsprechen oder daraus bestehen. Es ist erlaubt, 3 oder mehr nicht aufeinanderfolgende Zeichen hinzuzufügen, um die Komplexität des Passworts zu erhöhen.',
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
