import avatar001 from '@/assets/avatars/avatar-001.png';
import avatar002 from '@/assets/avatars/avatar-002.png';
import avatar003 from '@/assets/avatars/avatar-003.png';
import avatar004 from '@/assets/avatars/avatar-004.png';
import avatar005 from '@/assets/avatars/avatar-005.png';
import avatar006 from '@/assets/avatars/avatar-006.png';
import avatar007 from '@/assets/avatars/avatar-007.png';
import avatar008 from '@/assets/avatars/avatar-008.png';
import avatar009 from '@/assets/avatars/avatar-009.png';
import avatar010 from '@/assets/avatars/avatar-010.png';

export const Avatars = [
  avatar001,
  avatar002,
  avatar003,
  avatar004,
  avatar005,
  avatar006,
  avatar007,
  avatar008,
  avatar009,
  avatar010,
];

export const generateAvatarPlaceHolderById = (id: string) =>
  Avatars[(id.codePointAt(0) ?? 0) % Avatars.length];
