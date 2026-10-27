const log = {
  invalid_type: 'O tipo de registro é inválido.',
  invalid_time_window: '`end_time` deve ser posterior a `start_time`.',
  cleanup_invalid_bounds: '`after` deve ser anterior a `before`.',
  cleanup_boundary_in_future: '`before` não pode estar no futuro.',
};

export default Object.freeze(log);
