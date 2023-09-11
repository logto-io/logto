const password_policy = {
  password_requirements: 'Requisitos de contraseña',
  minimum_length: 'Longitud mínima',
  minimum_length_description: 'NIST sugiere usar <a>al menos 8 caracteres</a> para productos web.',
  minimum_length_error: 'La longitud mínima debe estar entre {{min}} y {{max}} (inclusive).',
  minimum_required_char_types: 'Tipos de caracteres requeridos mínimos',
  minimum_required_char_types_description:
    'Tipos de caracteres: mayúsculas (A-Z), minúsculas (a-z), números (0-9) y símbolos especiales ({{symbols}}).',
  password_rejection: 'Rechazo de contraseña',
  compromised_passwords: 'Contraseñas comprometidas',
  breached_passwords: 'Contraseñas vulneradas',
  breached_passwords_description:
    'Rechazar contraseñas encontradas previamente en bases de datos de vulnerabilidad.',
  restricted_phrases: 'Restringir frases de baja seguridad',
  restricted_phrases_tooltip:
    'Su contraseña debe evitar estas frases a menos que combine con 3 o más caracteres adicionales.',
  repetitive_or_sequential_characters: 'Caracteres repetitivos o secuenciales',
  repetitive_or_sequential_characters_description: 'Por ejemplo, "AAAA", "1234" y "abcd".',
  user_information: 'Información de usuario',
  user_information_description:
    'Por ejemplo, dirección de correo electrónico, número de teléfono, nombre de usuario, etc.',
  custom_words: 'Palabras personalizadas',
  custom_words_description:
    'Personaliza las palabras específicas del contexto, sin importar las mayúsculas y minúsculas, y una por línea.',
  custom_words_placeholder: 'Nombre de su servicio, nombre de la empresa, etc.',
};

export default Object.freeze(password_policy);
