import { type LogtoJwtTokenKeyType } from '@logto/schemas';

import Button from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { getPagePath } from '@/pages/CustomizeJwt/utils/path';

type Props = {
  tokenType: LogtoJwtTokenKeyType;
};

function CreateButton({ tokenType }: Props) {
  const link = getPagePath(tokenType, 'create');
  const { navigate } = useTenantPathname();

  return (
    <Button
      type="primary"
      title="jwt_claims.custom_jwt_create_button"
      onClick={() => {
        navigate(link);
      }}
    />
  );
}

export default CreateButton;
