import avatar001 from '@/assets/avatars/avatar-001.svg';
import avatar002 from '@/assets/avatars/avatar-002.svg';
import avatar003 from '@/assets/avatars/avatar-003.svg';
import avatar004 from '@/assets/avatars/avatar-004.svg';
import avatar005 from '@/assets/avatars/avatar-005.svg';
import avatar006 from '@/assets/avatars/avatar-006.svg';
import avatar007 from '@/assets/avatars/avatar-007.svg';
import avatar008 from '@/assets/avatars/avatar-008.svg';
import avatar009 from '@/assets/avatars/avatar-009.svg';
import avatar010 from '@/assets/avatars/avatar-010.svg';

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

export const getAvatarById = (id: string) => Avatars[(id.codePointAt(0) ?? 0) % Avatars.length];
