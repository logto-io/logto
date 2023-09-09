const password_policy = {
  password_requirements: 'Requisiti per la password',
  minimum_length: 'Lunghezza minima',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: 'La lunghezza minima deve essere compresa tra {{min}} e {{max}} (inclusi).',
  minimum_required_char_types: 'Tipi di caratteri minimi richiesti',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: 'Rifiuto password',
  compromised_passwords: 'Rifiuta password compromesse',
  breached_passwords: 'Password violate',
  breached_passwords_description:
    'Rifiuta password trovate in precedenza nei database delle violazioni.',
  restricted_phrases: 'Limita frasi poco sicure',
  restricted_phrases_tooltip:
    "Gli utenti non possono utilizzare password che siano esattamente uguali o composte dalle frasi elencate di seguito. L'aggiunta di 3 o più caratteri non consecutivi è consentita per aumentare la complessità della password.",
  repetitive_or_sequential_characters: 'Caratteri ripetitivi o sequenziali',
  repetitive_or_sequential_characters_description: 'Ad esempio, "AAAA", "1234" e "abcd".',
  user_information: 'Informazioni utente',
  user_information_description:
    'Ad esempio, indirizzo email, numero di telefono, nome utente, ecc.',
  custom_words: 'Parole personalizzate',
  custom_words_description:
    'Personalizza parole specifiche del contesto, non case-sensitive, una per riga.',
  custom_words_placeholder: "Nome del tuo servizio, nome dell'azienda, ecc.",
};

export default Object.freeze(password_policy);
