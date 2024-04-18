import type { UserProfileResponse } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import { useState } from 'react';

import FormCard from '@/components/FormCard';
import UserAvatar from '@/components/UserAvatar';
import { isCloud } from '@/consts/env';

import type { BasicUserField } from '../../containers/BasicUserInfoUpdateModal';
import BasicUserInfoUpdateModal from '../../containers/BasicUserInfoUpdateModal';
import type { Row } from '../CardContent';
import CardContent from '../CardContent';

type Props = {
  readonly user: UserProfileResponse;
  readonly onUpdate?: () => void;
};

function BasicUserInfoSection({ user, onUpdate }: Props) {
  const [editingField, setEditingField] = useState<BasicUserField>();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const { name, username, avatar } = user;

  const conditionalUsername: Array<Row<Nullable<string> | undefined>> = isCloud
    ? []
    : [
        {
          key: 'username',
          label: 'profile.settings.username',
          value: username,
          action: {
            name: 'profile.change',
            handler: () => {
              setEditingField('username');
              setIsUpdateModalOpen(true);
            },
          },
        },
      ];

  // Get the value of the editing simple field (avatar, username or name)
  const getSimpleFieldValue = (field: BasicUserField): string => {
    const value = field === 'avatar' ? avatar : user[field];

    return value ?? '';
  };

  return (
    <FormCard title="profile.settings.title">
      <CardContent
        title="profile.settings.profile_information"
        data={[
          {
            key: 'avatar',
            label: 'profile.settings.avatar',
            value: avatar,
            renderer: () => <UserAvatar size="large" user={user} />,
            action: {
              name: 'profile.change',
              handler: () => {
                setEditingField('avatar');
                setIsUpdateModalOpen(true);
              },
            },
          },
          {
            key: 'name',
            label: 'profile.settings.name',
            value: name,
            action: {
              name: name ? 'profile.change' : 'profile.set_name',
              handler: () => {
                setEditingField('name');
                setIsUpdateModalOpen(true);
              },
            },
          },
          ...conditionalUsername,
        ]}
      />
      {editingField && (
        <BasicUserInfoUpdateModal
          value={getSimpleFieldValue(editingField)}
          field={editingField}
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            onUpdate?.();
          }}
        />
      )}
    </FormCard>
  );
}

export default BasicUserInfoSection;
