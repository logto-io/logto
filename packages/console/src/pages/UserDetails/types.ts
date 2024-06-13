import type { User, UserProfileResponse } from '@logto/schemas';

export type UserDetailsForm = {
  primaryEmail: string;
  primaryPhone: string;
  username: string;
  name: string;
  avatar: string;
  customData: string;
  profile: string;
};

export type UserDetailsOutletContext = {
  user: UserProfileResponse;
  isDeleting: boolean;
  onUserUpdated: (user?: User) => void;
};
