const log = {
  invalid_type: 'ログタイプが無効です。',
  invalid_time_window: '`end_time` は `start_time` より後である必要があります。',
  cleanup_invalid_bounds: '`after` は `before` より前である必要があります。',
  cleanup_boundary_in_future: '`before` に未来の時刻は指定できません。',
};

export default Object.freeze(log);
