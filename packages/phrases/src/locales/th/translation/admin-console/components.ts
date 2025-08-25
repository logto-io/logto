const components = {
  uploader: {
    action_description: 'ลากแล้ววางหรือเรียกดู',
    uploading: 'กำลังอัปโหลด...',
    image_limit:
      'อัปโหลดรูปภาพที่มีขนาดไม่เกิน {{size, number}}KB เฉพาะ {{extensions, list(style: narrow; type: conjunction;)}} เท่านั้น',
    error_upload: 'เกิดข้อผิดพลาด อัปโหลดไฟล์ไม่สำเร็จ',
    error_file_size: 'ขนาดไฟล์ใหญ่เกินไป กรุณาอัปโหลดไฟล์ที่มีขนาดไม่เกิน {{limitWithUnit}}',
    error_file_type:
      'ประเภทไฟล์นี้ไม่รองรับ เฉพาะ {{extensions, list(style: narrow; type: conjunction;)}} เท่านั้น',
    error_file_count: 'คุณสามารถอัปโหลดได้ครั้งละ 1 ไฟล์เท่านั้น',
  },
};

export default Object.freeze(components);
