const log = {
  invalid_type: 'Тип журнала недействительный.',
  invalid_time_window: '`end_time` должно быть позже, чем `start_time`.',
  cleanup_boundary_in_future: '`end_time` не может быть в будущем.',
};

export default Object.freeze(log);
