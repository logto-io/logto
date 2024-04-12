import { condArray } from '@silverhand/essentials';
import { type RouteObject } from 'react-router-dom';

import { isDevFeaturesEnabled } from '@/consts/env';
import OrganizationDetails from '@/pages/OrganizationDetails';
import Organizations from '@/pages/Organizations';

export const organizations: RouteObject = {
  path: 'organizations',
  children: condArray(
    { index: true, element: <Organizations /> },
    { path: 'create', element: <Organizations /> },
    !isDevFeaturesEnabled && {
      path: 'template',
      element: <Organizations tab="template" />,
    },
    { path: ':id/*', element: <OrganizationDetails /> }
  ),
};
