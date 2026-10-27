const log = {
  invalid_type: 'El tipo de registro es inválido.',
  invalid_time_window: '`end_time` debe ser posterior a `start_time`.',
  cleanup_invalid_bounds: '`after` debe ser anterior a `before`.',
  cleanup_boundary_in_future: '`before` no puede estar en el futuro.',
};

export default Object.freeze(log);
