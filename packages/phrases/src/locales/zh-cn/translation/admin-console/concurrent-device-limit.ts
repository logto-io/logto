const concurrent_device_limit = {
  title: '同时设备限制',
  description: '控制每个用户在此应用上可以保持登录的设备数量。',
  enable: '启用同时设备限制',
  enable_description: '启用后，Logto 将对每个用户在此应用上的最大活跃授权数进行强制执行。',
  field: '每个应用的同时设备限制',
  field_description:
    '限制用户可以同时登录的设备数量。Logto 通过限制活跃授权强制执行此限制，并在超过限制时自动撤销最旧的授权。',
  field_placeholder: '留空表示无限制',
  should_be_greater_than_zero: '应大于 0。',
};

export default Object.freeze(concurrent_device_limit);
