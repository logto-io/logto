const concurrent_device_limit = {
  title: 'Límite de dispositivos concurrentes',
  enable: 'Habilitar límite de dispositivos concurrentes',
  enable_description:
    'Cuando está habilitado, Logto aplica el máximo de concesiones activas por usuario para esta aplicación.',
  field: 'Límite de dispositivos concurrentes por aplicación',
  field_description:
    'Limita cuántos dispositivos puede tener un usuario conectados al mismo tiempo. Logto aplica esto limitando las concesiones activas y revoca automáticamente la concesión más antigua cuando se excede el límite.',
  field_placeholder: 'Dejar vacío para sin límite',
  should_be_greater_than_zero: 'Debe ser mayor que 0.',
};

export default Object.freeze(concurrent_device_limit);
