const password_rejected = {
  too_short: 'La longitud mínima es {{min}}.',
  too_long: 'La longitud máxima es {{max}}.',
  character_types: 'Se necesitan al menos {{min}} tipos de caracteres.',
  unsupported_characters: 'Se encontró un carácter no admitido.',
  pwned: 'Evite usar contraseñas simples que sean fáciles de adivinar.',
  restricted_found: 'Evite utilizar en exceso {{list, list}}.',
  restricted_repetition: 'caracteres repetidos',
  restricted_sequence: 'caracteres secuenciales',
  restricted_userinfo: 'su información personal',
  restricted_words: 'contexto del producto',
};

export default Object.freeze(password_rejected);
