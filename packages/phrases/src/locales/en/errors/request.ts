const request = {
  invalid_input: 'Input is invalid. {{details}}',
  general: 'Request error occurred.',
  range_not_satisfiable: 'Range not satisfiable.',
  feature_not_supported: 'This feature is not supported in the current environment.',
  rate_limited: 'Too many requests. Please try again later.',
  message_rate_limited: 'Too many messages sent to this recipient. Please try again later.',
};

export default Object.freeze(request);
