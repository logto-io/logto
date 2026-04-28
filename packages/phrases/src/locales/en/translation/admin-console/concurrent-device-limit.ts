const concurrent_device_limit = {
  title: 'Concurrent device limit',
  enable: 'Enable concurrent device limit',
  enable_description:
    'When enabled, Logto enforces the maximum active grants per user for this app.',
  field: 'Concurrent device limit per app',
  field_description:
    'Limit how many devices a user can be signed in to at the same time. Logto enforces this by limiting active grants and automatically revokes the oldest grant when the limit is exceeded.',
  field_placeholder: 'Leave empty for no limit',
  should_be_greater_than_zero: 'Should be greater than 0.',
};

export default Object.freeze(concurrent_device_limit);
