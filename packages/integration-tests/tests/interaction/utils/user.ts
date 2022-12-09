import { createUser } from '@/api';
import {
  generateUsername,
  generateEmail,
  generatePhone,
  generatePassword,
  generateName,
} from '@/utils';

export type NewUserProfileOptions = {
  username?: true;
  primaryEmail?: true;
  primaryPhone?: true;
};

export const generateNewUser = async <T extends NewUserProfileOptions>({
  username,
  primaryEmail,
  primaryPhone,
}: T) => {
  type UserProfile = {
    password: string;
    name: string;
  } & {
    [K in keyof T]: T[K] extends true ? string : never;
  };

  // @ts-expect-error - TS can't map the type of userProfile to the UserProfile defined above
  const userProfile: UserProfile = {
    password: generatePassword(),
    name: generateName(),
    ...(username ? { username: generateUsername() } : {}),
    ...(primaryEmail ? { primaryEmail: generateEmail() } : {}),
    ...(primaryPhone ? { primaryPhone: generatePhone() } : {}),
  };

  const user = await createUser(userProfile);

  return { user, userProfile };
};
