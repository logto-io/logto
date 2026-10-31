const log = {
  invalid_type: 'Typ dziennika jest nieprawidłowy.',
  invalid_time_window: '`end_time` musi być późniejsze niż `start_time`.',
  cleanup_boundary_in_future: '`end_time` nie może być w przyszłości.',
};

export default Object.freeze(log);
