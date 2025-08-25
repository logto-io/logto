const api_resources = {
  page_title: 'ทรัพยากร API',
  title: 'ทรัพยากร API',
  subtitle: 'กำหนด API ที่แอปพลิเคชันที่ได้รับอนุญาตของคุณสามารถใช้งานได้',
  create: 'สร้างทรัพยากร API',
  api_name: 'ชื่อ API',
  api_name_placeholder: 'กรอกชื่อ API ของคุณ',
  api_identifier: 'ตัวระบุ API',
  api_identifier_placeholder: 'https://ตัวระบุ-api-ของคุณ',
  api_identifier_tip:
    'ตัวระบุเฉพาะของทรัพยากร API จะต้องเป็น URI แบบสมบูรณ์ และต้องไม่มีส่วน fragment (#) ตรงกับ <a>พารามิเตอร์ resource</a> ใน OAuth 2.0',
  default_api: 'API เริ่มต้น',
  default_api_label:
    'สามารถตั้งค่า API เริ่มต้นได้เพียงศูนย์หรือหนึ่งรายการต่อผู้เช่า\nเมื่อมีการกำหนด API เริ่มต้นแล้ว สามารถละพารามิเตอร์ resource ในคำขอ auth ได้ จากนั้นการแลกเปลี่ยน token ทั้งหมดจะใช้ API ดังกล่าวเป็น audience โดยปริยาย ผลลัพธ์คือจะออก JWT ให้ <a>ดูข้อมูลเพิ่มเติม</a>',
  api_resource_created: 'สร้างทรัพยากร API {{name}} สำเร็จแล้ว',
  invalid_resource_indicator_format: 'ตัวชี้วัด API ต้องเป็น URI แบบสมบูรณ์ที่ถูกต้อง',
};

export default Object.freeze(api_resources);
