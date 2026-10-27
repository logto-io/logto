const log = {
  invalid_type: '로그 종류가 유효하지 않아요.',
  invalid_time_window: '`end_time`은 `start_time` 이후여야 해요.',
  cleanup_invalid_bounds: '`after`는 `before`보다 이전이어야 합니다.',
  cleanup_boundary_in_future: '`before`에는 미래 시각을 지정할 수 없습니다.',
};

export default Object.freeze(log);
