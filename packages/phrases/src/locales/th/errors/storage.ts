const storage = {
  not_configured: 'ยังไม่ได้กำหนดผู้ให้บริการจัดเก็บข้อมูล',
  missing_parameter: 'ขาดพารามิเตอร์ {{parameter}} สำหรับผู้ให้บริการจัดเก็บข้อมูล',
  upload_error: 'อัปโหลดไฟล์ไปยังผู้ให้บริการจัดเก็บข้อมูลไม่สำเร็จ',
  download_error: 'Failed to download file from the storage provider.',
  invalid_custom_ui_zip:
    'ไม่สามารถอ่านไฟล์บีบอัดได้ โปรดสร้างไฟล์ ZIP ที่ไม่ว่างเปล่าโดยใช้ Deflate หรือไม่บีบอัด แล้วอัปโหลดอีกครั้ง',
  custom_ui_file_too_large:
    'ไฟล์ "{{name}}" หลังแตกไฟล์ต้องมีขนาดน้อยกว่า 10 MiB โปรดลดขนาดไฟล์แล้วอัปโหลดอีกครั้ง',
  custom_ui_too_many_entries:
    'ไฟล์ ZIP มีรายการมากเกินไป โปรดจำกัดจำนวนไฟล์และโฟลเดอร์รวมกันไม่เกิน 200 รายการแล้วอัปโหลดอีกครั้ง',
};

export default Object.freeze(storage);
