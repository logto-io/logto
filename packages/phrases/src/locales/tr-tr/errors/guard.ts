const guard = {
  invalid_input: 'İstek {{type}} geçersiz.',
  invalid_pagination: 'İstenen sayfalandırma değeri geçersiz.',
  can_not_get_tenant_id: 'İstekten kiracı kimliği alınamadı.',
  file_size_exceeded: 'Dosya boyutu aşıldı.',
  mime_type_not_allowed: 'MIME türü izin verilmiyor.',
  not_allowed_for_admin_tenant: 'Yönetici kiracısı için izin verilmez.',
};

export default Object.freeze(guard);
