const log = {
  invalid_type: 'Il tipo di registro non è valido.',
  invalid_time_window: '`end_time` deve essere successivo a `start_time`.',
  cleanup_boundary_in_future: '`end_time` non può essere nel futuro.',
};

export default Object.freeze(log);
