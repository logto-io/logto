const log = {
  invalid_type: 'نوع السجل غير صالح.',
  invalid_time_window: 'يجب أن يكون `end_time` بعد `start_time`.',
  cleanup_invalid_bounds: 'يجب أن يكون `after` قبل `before`.',
  cleanup_boundary_in_future: 'لا يمكن أن يكون `before` في المستقبل.',
};

export default Object.freeze(log);
