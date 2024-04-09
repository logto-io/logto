import { type TenantRole } from '@logto/schemas';

import { type Props as TagProps } from '@/ds-components/Tag';

export type InviteeEmailItem = {
  /**
   * Generate a random unique id for each option to handle deletion.
   * Sometimes we may have options with the same value, which is allowed when inputting but prohibited when submitting.
   */
  id: string;
  value: string;
  /**
   * The `status` is used to indicate the input status of the email item (could fall into following categories):
   * - undefined: valid email
   * - 'info': duplicated email or invalid email format.
   */
  status?: Extract<TagProps['status'], 'error'>;
};

export type InviteMemberForm = {
  emails: InviteeEmailItem[];
  role: TenantRole;
};
