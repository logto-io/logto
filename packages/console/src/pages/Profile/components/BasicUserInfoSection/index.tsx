import type { UserInfoResponse } from '@logto/react';
import type { Nullable } from '@silverhand/essentials';
import { useState } from 'react';

import UserAvatar from '@/components/UserAvatar';
import { isCloud } from '@/consts/cloud';

import type { BasicUserField } from '../../containers/BasicUserInfoUpdateModal';
import BasicUserInfoUpdateModal from '../../containers/BasicUserInfoUpdateModal';
import type { Row } from '../CardContent';
import CardContent from '../CardContent';
import Section from '../Section';
import * as styles from './index.module.scss';

type Props = {
  user: UserInfoResponse;
  onUpdate?: () => void;
};

const BasicUserInfoSection = ({ user, onUpdate }: Props) => {
  const [editingField, setEditingField] = useState<BasicUserField>();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const { name, username, picture: avatar } = user;

  const conditionalUsername: Array<Row<Nullable<string> | undefined>> = isCloud
    ? []
    : [
        {
          label: 'profile.settings.username',
          value: username,
          actionName: 'profile.change',
          action: () => {
            setEditingField('username');
            setIsUpdateModalOpen(true);
          },
        },
      ];

  // Get the value of the editing simple field (avatar, username or name)
  const getSimpleFieldValue = (field: BasicUserField): string => {
    const value = field === 'avatar' ? avatar : user[field];

    return value ?? '';
  };

  return (
    <Section title="profile.settings.title">
      <CardContent
        title="profile.settings.profile_information"
        data={[
          {
            label: 'profile.settings.avatar',
            value: avatar,
            renderer: (value) => <UserAvatar className={styles.avatar} url={value} />,
            actionName: 'profile.change',
            action: () => {
              setEditingField('avatar');
              setIsUpdateModalOpen(true);
            },
          },
          {
            label: 'profile.settings.name',
            value: name,
            actionName: name ? 'profile.change' : 'profile.set_name',
            action: () => {
              setEditingField('name');
              setIsUpdateModalOpen(true);
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
    </Section>
  );
};

export default BasicUserInfoSection;
