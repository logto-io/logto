const password_rejected = {
  too_short: 'Mínimo de comprimento é {{min}}.',
  too_long: 'Máximo de comprimento é {{max}}.',
  character_types: 'São necessários pelo menos {{min}} tipos de caracteres.',
  unsupported_characters: 'Caractere não suportado encontrado.',
  pwned: 'Evite o uso de senhas simples que são fáceis de adivinhar.',
  restricted_found: 'Evite o uso excessivo de {{list, list}}.',
  restricted_repetition: 'caracteres repetidos',
  restricted_sequence: 'caracteres sequenciais',
  restricted_userinfo: 'suas informações pessoais',
  restricted_words: 'contexto do produto',
};

export default Object.freeze(password_rejected);
