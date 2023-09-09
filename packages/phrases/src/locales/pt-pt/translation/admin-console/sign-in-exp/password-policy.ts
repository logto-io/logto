const password_policy = {
  password_requirements: 'Requisitos de senha',
  minimum_length: 'Comprimento mínimo',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: 'O comprimento mínimo deve estar entre {{min}} e {{max}} (inclusive).',
  minimum_required_char_types: 'Tipos de caracteres mínimos necessários',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: 'Rejeição de senha',
  compromised_passwords: 'Recusar senhas comprometidas',
  breached_passwords: 'Senhas violadas',
  breached_passwords_description:
    'Recusar senhas encontradas anteriormente em bancos de dados de violação.',
  restricted_phrases: 'Restringir frases de baixa segurança',
  restricted_phrases_tooltip:
    'Usuários não podem usar senhas exatamente iguais ou compostas pelas frases listadas abaixo. A adição de 3 ou mais caracteres não consecutivos é permitida para aumentar a complexidade da senha.',
  repetitive_or_sequential_characters: 'Caracteres repetitivos ou sequenciais',
  repetitive_or_sequential_characters_description: 'Ex., "AAAA", "1234" e "abcd".',
  user_information: 'Informações do usuário',
  user_information_description:
    'Ex., endereço de e-mail, número de telefone, nome de usuário, etc.',
  custom_words: 'Palavras personalizadas',
  custom_words_description:
    'Personalize palavras específicas do contexto, não diferenciando maiúsculas de minúsculas e uma por linha.',
  custom_words_placeholder: 'Nome de seu serviço, nome da empresa, etc.',
};

export default Object.freeze(password_policy);
