const profile = {
  name: 'Nome',
  avatar: 'Avatar',
  givenName: 'Nome',
  familyName: 'Sobrenome',
  middleName: 'Nome do meio',
  fullname: 'Nome completo',
  nickname: 'Apelido',
  preferredUsername: 'Nome de usuário preferido',
  profile: 'Perfil',
  website: 'Site',
  gender: 'Gênero',
  birthdate: 'Data de nascimento',
  zoneinfo: 'Fuso horário',
  locale: 'Localidade',
  address: {
    formatted: 'Endereço',
    streetAddress: 'Endereço',
    locality: 'Cidade',
    region: 'Estado/Província',
    postalCode: 'CEP',
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
    upload: 'Upload photo',
    replace: 'Replace photo',
    remove: 'Remove',
    uploading: 'Uploading...',
    error_file_type: 'File type must be {{extensions}}.',
    error_file_size: 'File size must not exceed {{limit}}.',
    error_upload: 'Failed to upload photo. Please try again.',
  },
};

export default Object.freeze(profile);
