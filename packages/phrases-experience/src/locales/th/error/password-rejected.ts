import { type PasswordRejectionCode } from '@logto/core-kit';

type BreakdownKeysToObject<Key extends string> = {
  [K in Key as K extends `${infer A}.${string}` ? A : K]: K extends `${string}.${infer B}`
    ? BreakdownKeysToObject<B>
    : string;
};

type RejectionPhrases = BreakdownKeysToObject<PasswordRejectionCode>;

const password_rejected = {
  too_short: 'ความยาวขั้นต่ำคือ {{min}} ตัวอักษร',
  too_long: 'ความยาวสูงสุดคือ {{max}} ตัวอักษร',
  character_types: 'ต้องมีอักขระอย่างน้อย {{min}} ประเภท',
  unsupported_characters: 'พบอักขระที่ไม่รองรับ',
  pwned: 'หลีกเลี่ยงการใช้รหัสผ่านที่ง่ายต่อการคาดเดา',
  restricted_found: 'หลีกเลี่ยงการใช้ {{list, list}} ซ้ำบ่อยเกินไป',
  restricted: {
    repetition: 'อักขระที่ซ้ำกัน',
    sequence: 'อักขระที่เรียงตามลำดับ',
    user_info: 'ข้อมูลส่วนตัวของคุณ',
    words: 'บริบทของผลิตภัณฑ์',
  },
} satisfies RejectionPhrases & {
  // Use for displaying a list of restricted issues
  restricted_found: string;
};

export default Object.freeze(password_rejected);
