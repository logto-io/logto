const log = {
  invalid_type: 'Der Log Typ ist ungültig.',
  invalid_time_window: '`end_time` muss nach `start_time` liegen.',
  cleanup_boundary_in_future: '`end_time` darf nicht in der Zukunft liegen.',
};

export default Object.freeze(log);
