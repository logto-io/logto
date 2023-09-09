const password_policy = {
  password_requirements: 'Requisitos de la contraseña',
  minimum_length: 'Longitud mínima',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: 'La longitud mínima debe estar entre {{min}} y {{max}} (inclusive).',
  minimum_required_char_types: 'Tipos de caracteres requeridos mínimos',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: 'Rechazo de contraseña',
  compromised_passwords: 'Rechazar contraseñas comprometidas',
  breached_passwords: 'Contraseñas vulneradas',
  breached_passwords_description:
    'Rechazar contraseñas encontradas previamente en bases de datos de vulnerabilidad.',
  restricted_phrases: 'Restringir frases de baja seguridad',
  restricted_phrases_tooltip:
    'Los usuarios no pueden utilizar contraseñas que sean exactamente iguales o estén compuestas por las frases enumeradas a continuación. Se permite agregar 3 o más caracteres no consecutivos para aumentar la complejidad de la contraseña.',
  repetitive_or_sequential_characters: 'Caracteres repetitivos o secuenciales',
  repetitive_or_sequential_characters_description: 'Por ejemplo, "AAAA", "1234" y "abcd".',
  user_information: 'Información del usuario',
  user_information_description:
    'Por ejemplo, dirección de correo electrónico, número de teléfono, nombre de usuario, etc.',
  custom_words: 'Palabras personalizadas',
  custom_words_description:
    'Personaliza palabras específicas del contexto, sin tener en cuenta mayúsculas y minúsculas, y una por línea.',
  custom_words_placeholder: 'Nombre de su servicio, nombre de la empresa, etc.',
};

export default Object.freeze(password_policy);
