const log = {
  invalid_type: 'Typ dziennika jest nieprawidłowy.',
  invalid_time_window: '`end_time` musi być późniejsze niż `start_time`.',
  cleanup_invalid_bounds: '`after` musi być wcześniejsze niż `before`.',
  cleanup_boundary_in_future: '`before` nie może być w przyszłości.',
};

export default Object.freeze(log);
