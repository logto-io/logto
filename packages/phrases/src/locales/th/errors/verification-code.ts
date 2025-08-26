const verification_code = {
  phone_email_empty: 'ทั้งโทรศัพท์และอีเมลว่างเปล่า',
  not_found: 'ไม่พบรหัสยืนยัน กรุณาส่งรหัสยืนยันก่อน',
  phone_mismatch: 'หมายเลขโทรศัพท์ไม่ตรงกัน กรุณาขอรหัสยืนยันใหม่',
  email_mismatch: 'อีเมลไม่ตรงกัน กรุณาขอรหัสยืนยันใหม่',
  code_mismatch: 'รหัสยืนยันไม่ถูกต้อง',
  expired: 'รหัสยืนยันหมดอายุแล้ว กรุณาขอรหัสยืนยันใหม่',
  exceed_max_try: 'เกินจำนวนครั้งที่สามารถพยายามกรอกรหัสยืนยัน กรุณาขอรหัสยืนยันใหม่',
};

export default Object.freeze(verification_code);
