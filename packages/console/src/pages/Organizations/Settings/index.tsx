import FormCard from '@/components/FormCard';

import PermissionsField from '../PermissionsField';

export default function Settings() {
  return (
    <FormCard
      title="organizations.access_control"
      description="organizations.access_control_description"
    >
      <PermissionsField />
    </FormCard>
  );
}
