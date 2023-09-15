const password_rejected = {
  too_short: 'O comprimento mínimo é {{min}}.',
  too_long: 'O comprimento máximo é {{max}}.',
  character_types: 'Pelo menos {{min}} tipos de caracteres são necessários.',
  unsupported_characters: 'Caractere não suportado encontrado.',
  pwned: 'Evite o uso de senhas simples que são fáceis de adivinhar.',
  restricted_found: 'Evite usar em excesso {{list, list}}.',
  'restricted.repetition': 'caracteres repetidos',
  'restricted.sequence': 'caracteres sequenciais',
  'restricted.user_info': 'suas informações pessoais',
  'restricted.words': 'contexto do produto',
};

export default Object.freeze(password_rejected);
