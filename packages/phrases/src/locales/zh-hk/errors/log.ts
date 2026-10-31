const log = {
  invalid_type: '日誌類型無效。',
  invalid_time_window: '`end_time` 必須晚於 `start_time`。',
  cleanup_boundary_in_future: '`end_time` 不能是未來的時間。',
};

export default Object.freeze(log);
