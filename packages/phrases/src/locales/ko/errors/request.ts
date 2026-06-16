const request = {
  invalid_input: '입력된 값이 유효하지 않아요. {{details}}',
  general: '요청 중에 오류가 발생했어요.',
  range_not_satisfiable: '범위가 충족되지 않습니다.',
  feature_not_supported: '이 기능은 현재 환경에서 지원되지 않습니다.',
  rate_limited: '요청이 너무 많습니다. 나중에 다시 시도해 주세요.',
};

export default Object.freeze(request);
