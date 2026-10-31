const log = {
  invalid_type: '日志类型无效。',
  invalid_time_window: '`end_time` 必须晚于 `start_time`。',
  cleanup_boundary_in_future: '`end_time` 不能是未来的时间。',
};

export default Object.freeze(log);
