const log = {
  invalid_type: 'Тип журнала недействительный.',
  invalid_time_window: '`end_time` должно быть позже, чем `start_time`.',
  cleanup_invalid_bounds: '`after` должен быть раньше `before`.',
  cleanup_boundary_in_future: '`before` не может быть в будущем.',
};

export default Object.freeze(log);
