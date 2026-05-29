const profile = {
  name: 'Nome',
  avatar: 'Avatar',
  givenName: 'Nome próprio',
  familyName: 'Apelido',
  middleName: 'Nome do meio',
  fullname: 'Nome completo',
  nickname: 'Alcunha',
  preferredUsername: 'Nome de utilizador preferido',
  profile: 'Perfil',
  website: 'Website',
  gender: 'Género',
  birthdate: 'Data de nascimento',
  zoneinfo: 'Fuso horário',
  locale: 'Localização',
  address: {
    formatted: 'Endereço',
    streetAddress: 'Morada',
    locality: 'Cidade',
    region: 'Distrito/Província',
    postalCode: 'Código postal',
    country: 'País',
  },
  gender_options: {
    female: 'Feminino',
    male: 'Masculino',
    prefer_not_to_say: 'Prefiro não dizer',
  },
  checkbox_value: {
    checked: 'Sim',
    unchecked: 'Não',
  },
  avatar_upload: {
    upload: 'Carregar',
    remove: 'Remover',
    uploading: 'A carregar...',
    hint: 'Tamanho recomendado 1:1, até {{limit}}.',
    error_file_type: 'O tipo de ficheiro deve ser {{extensions}}.',
    error_file_size: 'O tamanho do ficheiro não pode exceder {{limit}}.',
    error_storage_not_configured:
      'Não foi possível carregar a fotografia. Tente novamente mais tarde.',
    error_upload: 'Falha ao carregar a fotografia. Tente novamente.',
  },
};

export default Object.freeze(profile);
