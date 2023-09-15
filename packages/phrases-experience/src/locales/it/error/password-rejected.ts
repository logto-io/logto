const password_rejected = {
  too_short: 'La lunghezza minima è {{min}}.',
  too_long: 'La lunghezza massima è {{max}}.',
  character_types: 'Sono richiesti almeno {{min}} tipi di caratteri.',
  unsupported_characters: 'Carattere non supportato trovato.',
  pwned: 'Evita di utilizzare password semplici facili da indovinare.',
  restricted_found: 'Evita di utilizzare in eccesso {{list, list}}.',
  'restricted.repetition': 'caratteri ripetuti',
  'restricted.sequence': 'caratteri sequenziali',
  'restricted.user_info': 'le tue informazioni personali',
  'restricted.words': 'contesto del prodotto',
};

export default Object.freeze(password_rejected);
