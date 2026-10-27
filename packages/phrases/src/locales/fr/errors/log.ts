const log = {
  invalid_type: 'Type de journalisation invalide.',
  invalid_time_window: '`end_time` doit être postérieur à `start_time`.',
  cleanup_invalid_bounds: '`after` doit être antérieur à `before`.',
  cleanup_boundary_in_future: '`before` ne doit pas être dans le futur.',
};

export default Object.freeze(log);
