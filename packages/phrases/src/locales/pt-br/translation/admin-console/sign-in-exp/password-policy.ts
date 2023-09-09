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
  compromised_passwords: 'Rejeitar senha comprometida',
  breached_passwords: 'Senhas comprometidas',
  breached_passwords_description:
    'Rejeitar senhas encontradas em bancos de dados de violação anteriormente.',
  restricted_phrases: 'Restringir frases de baixa segurança',
  restricted_phrases_tooltip:
    'Os usuários não podem usar senhas que sejam exatamente iguais ou compostas das frases listadas abaixo. A adição de 3 ou mais caracteres não consecutivos é permitida para aumentar a complexidade da senha.',
  repetitive_or_sequential_characters: 'Caracteres repetitivos ou sequenciais',
  repetitive_or_sequential_characters_description: 'Por exemplo, "AAAA", "1234" e "abcd".',
  user_information: 'Informações do usuário',
  user_information_description:
    'Por exemplo, endereço de e-mail, número de telefone, nome de usuário, etc.',
  custom_words: 'Palavras personalizadas',
  custom_words_description:
    'Personalize palavras específicas do contexto, sem diferenciação de maiúsculas e minúsculas, e uma por linha.',
  custom_words_placeholder: 'Nome do seu serviço, nome da empresa, etc.',
};

export default Object.freeze(password_policy);
