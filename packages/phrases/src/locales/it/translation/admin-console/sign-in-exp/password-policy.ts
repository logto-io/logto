const password_policy = {
  password_requirements: 'Requisiti per la password',
  minimum_length: 'Lunghezza minima',
  minimum_length_description: 'NIST consiglia di utilizzare almeno 8 caratteri per i prodotti web.',
  minimum_length_error: 'La lunghezza minima deve essere compresa tra {{min}} e {{max}} (inclusi).',
  minimum_required_char_types: 'Tipi di caratteri minimi richiesti',
  minimum_required_char_types_description:
    'Tipi di caratteri: maiuscole (A-Z), minuscole (a-z), numeri (0-9) e simboli speciali ({{symbols}}).',
  password_rejection: 'Rifiuto password',
  compromised_passwords: 'Rifiuta password compromesse',
  breached_passwords: 'Password violate',
  breached_passwords_description:
    'Rifiuta password trovate in precedenza nei database delle violazioni.',
  restricted_phrases: 'Limita frasi poco sicure',
  restricted_phrases_tooltip:
    'La tua password dovrebbe evitare queste frasi a meno che non le combiniate con 3 o più caratteri extra.',
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
