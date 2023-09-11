const password_policy = {
  password_requirements: 'Requisitos de senha',
  minimum_length: 'Comprimento mínimo',
  minimum_length_description:
    'O NIST sugere o uso de <a>pelo menos 8 caracteres</a> para produtos na web.',
  minimum_length_error: 'O comprimento mínimo deve estar entre {{min}} e {{max}} (inclusive).',
  minimum_required_char_types: 'Tipos de caracteres mínimos necessários',
  minimum_required_char_types_description:
    'Tipos de caracteres: maiúsculas (A-Z), minúsculas (a-z), números (0-9) e símbolos especiais ({{symbols}}).',
  password_rejection: 'Rejeição de senha',
  compromised_passwords: 'Senhas comprometidas',
  breached_passwords: 'Senhas comprometidas',
  breached_passwords_description:
    'Rejeitar senhas encontradas em bancos de dados de violações anteriores.',
  restricted_phrases: 'Restringir frases de baixa segurança',
  restricted_phrases_tooltip:
    'Sua senha deve evitar essas frases, a menos que você combine com 3 ou mais caracteres extras.',
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
