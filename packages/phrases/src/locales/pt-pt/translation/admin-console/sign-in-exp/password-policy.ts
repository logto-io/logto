const password_policy = {
  password_requirements: 'Requisitos de password',
  minimum_length: 'Comprimento mínimo',
  minimum_length_description:
    'O NIST sugere o uso de <a>pelo menos 8 caracteres</a> para produtos web.',
  minimum_length_error: 'O comprimento mínimo deve estar entre {{min}} e {{max}} (inclusive).',
  minimum_required_char_types: 'Tipos de caracteres mínimos necessários',
  minimum_required_char_types_description:
    'Tipos de caracteres: letras maiúsculas (A-Z), letras minúsculas (a-z), números (0-9) e símbolos especiais ({{symbols}}).',
  password_rejection: 'Rejeição de password',
  compromised_passwords: 'Passwords comprometidos',
  breached_passwords: 'Passwords violados',
  breached_passwords_description:
    'Recusar passwords encontradas anteriormente em bancos de dados de violação.',
  restricted_phrases: 'Frases de baixa segurança restritas',
  restricted_phrases_tooltip:
    'Your password should avoid these phrases unless you combine with 3 or more extra characters.',
  repetitive_or_sequential_characters: 'Caracteres repetitivos ou sequenciais',
  repetitive_or_sequential_characters_description: 'Ex., "AAAA", "1234" e "abcd".',
  user_information: 'Informações do utilizador',
  user_information_description:
    'Ex., endereço de email, número de telefone, nome de utilizador, etc.',
  custom_words: 'Palavras personalizadas',
  custom_words_description:
    'Personalize palavras específicas do contexto, não diferenciando maiúsculas de minúsculas e uma por linha.',
  custom_words_placeholder: 'Nome de seu serviço, nome da empresa, etc.',
};

export default Object.freeze(password_policy);
