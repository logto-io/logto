const log = {
  invalid_type: 'نوع گزارش نامعتبر است.',
  invalid_time_window: '`end_time` باید بعد از `start_time` باشد.',
  cleanup_invalid_bounds: '`after` باید پیش از `before` باشد.',
  cleanup_boundary_in_future: '`before` نباید در آینده باشد.',
};

export default Object.freeze(log);
