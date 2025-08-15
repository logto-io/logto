const custom_profile_fields = {
  entity_not_exists_with_names: 'Verilen isimlerle varlıklar bulunamadı: {{names}}',
  invalid_min_max_input: 'Geçersiz minimum ve maksimum giriş.',
  invalid_default_value: 'Geçersiz varsayılan değer.',
  invalid_options: 'Geçersiz alan seçenekleri.',
  invalid_regex_format: 'Geçersiz regex formatı.',
  invalid_address_components: 'Geçersiz adres bileşenleri.',
  invalid_fullname_components: 'Geçersiz tam ad bileşenleri.',
  invalid_sub_component_type: 'Geçersiz alt bileşen türü.',
  name_exists: 'Bu isimle zaten bir alan mevcut.',
  conflicted_sie_order: 'Oturum Açma Deneyimi için çakışan alan sırası değeri.',
  invalid_name:
    'Geçersiz alan adı, sadece harfler veya sayılar kullanılabilir, büyük/küçük harf duyarlıdır.',
  name_conflict_sign_in_identifier:
    'Geçersiz alan adı. Ayrılmış oturum açma tanımlayıcı anahtarları: {{name}}.',
  name_conflict_built_in_prop:
    'Geçersiz alan adı. Ayrılmış yerleşik kullanıcı profili özelliği adları: {{name}}.',
  name_conflict_custom_data: 'Geçersiz alan adı. Ayrılmış özel veri anahtarları: {{name}}.',
  name_required: 'Alan adı gereklidir.',
};

export default Object.freeze(custom_profile_fields);
