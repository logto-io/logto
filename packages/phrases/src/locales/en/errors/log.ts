const log = {
  invalid_type: 'The log type is invalid.',
  invalid_time_window: '`end_time` must be after `start_time`.',
  cleanup_invalid_bounds: '`after` must be earlier than `before`.',
  cleanup_boundary_in_future: '`before` must not be in the future.',
};

export default Object.freeze(log);
