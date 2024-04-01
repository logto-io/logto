import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';
import classNames from 'classnames';
import { Outlet } from 'react-router-dom';

import Research from '@/assets/icons/research.svg';
import PageMeta from '@/components/PageMeta';
import { OrganizationTemplateTabs, organizationTemplateLink } from '@/consts';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import * as pageLayout from '@/scss/page-layout.module.scss';

import * as styles from './index.module.scss';

const basePathname = '/organization-template';

function OrganizationTemplate() {
  const { getDocumentationUrl } = useDocumentationUrl();

  return (
    <div className={classNames(pageLayout.container, styles.container)}>
      <PageMeta titleKey="organization_template.title" />
      <div className={pageLayout.headline}>
        <CardTitle
          title="organization_template.title"
          subtitle="organization_template.subtitle"
          learnMoreLink={{
            href: getDocumentationUrl(organizationTemplateLink),
            targetBlank: 'noopener',
          }}
        />
        <Button
          icon={<Research />}
          title="application_details.check_guide"
          type="outline"
          onClick={() => {
            // Todo @xiaoyijun implement guide
          }}
        />
      </div>
      <TabNav>
        <TabNavItem href={`${basePathname}/${OrganizationTemplateTabs.OrgRoles}`}>
          <DynamicT forKey="organization_template.org_roles.tab_name" />
        </TabNavItem>
        <TabNavItem href={`${basePathname}/${OrganizationTemplateTabs.OrgPermissions}`}>
          <DynamicT forKey="organization_template.org_permissions.tab_name" />
        </TabNavItem>
      </TabNav>
      <Outlet />
    </div>
  );
}

export default withAppInsights(OrganizationTemplate);
