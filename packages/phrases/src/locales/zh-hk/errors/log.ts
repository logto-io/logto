const log = {
  invalid_type: '日誌類型無效。',
  invalid_time_window: '`end_time` 必須晚於 `start_time`。',
  cleanup_invalid_bounds: '`after` 必須早於 `before`。',
  cleanup_boundary_in_future: '`before` 不能是未來的時間。',
};

export default Object.freeze(log);
