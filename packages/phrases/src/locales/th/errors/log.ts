const log = {
  invalid_type: 'ประเภทบันทึกไม่ถูกต้อง',
  invalid_time_window: '`end_time` ต้องอยู่หลัง `start_time`',
  cleanup_invalid_bounds: '`after` ต้องอยู่ก่อน `before`',
  cleanup_boundary_in_future: '`before` ต้องไม่อยู่ในอนาคต',
};

export default Object.freeze(log);
