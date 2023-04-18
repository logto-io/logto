import type { User } from '@/types/user';

export type UserDetailsForm = {
  primaryEmail: string;
  primaryPhone: string;
  username: string;
  name: string;
  avatar: string;
  customData: string;
};

export type UserDetailsOutletContext = {
  user: User;
  isDeleting: boolean;
  onUserUpdated: (user?: User) => void;
};
