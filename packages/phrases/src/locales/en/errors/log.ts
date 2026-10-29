const log = {
  invalid_type: 'The log type is invalid.',
  invalid_time_window: '`end_time` must be after `start_time`.',
  cleanup_boundary_in_future: '`end_time` must not be in the future.',
};

export default Object.freeze(log);
