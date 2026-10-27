const log = {
  invalid_type: 'Geçersiz günlük türü.',
  invalid_time_window: "`end_time`, `start_time`'dan sonra olmalıdır.",
  cleanup_invalid_bounds: '`after` değeri `before` değerinden önce olmalıdır.',
  cleanup_boundary_in_future: '`before` gelecekte bir zaman olamaz.',
};

export default Object.freeze(log);
