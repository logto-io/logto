import { useState } from 'react';

import ChangePasswordModal from '../../modals/ChangePasswordModal';
import CardContent from '../CardContent';
import Section from '../Section';

const PasswordSection = () => {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  return (
    <Section title="profile.password.title">
      <CardContent
        title="profile.password.reset_password"
        data={[
          {
            label: 'profile.password.password',
            value: '******',
            actionName: 'profile.change',
            action: () => {
              setIsChangePasswordModalOpen(true);
            },
          },
        ]}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => {
          setIsChangePasswordModalOpen(false);
        }}
      />
    </Section>
  );
};

export default PasswordSection;
