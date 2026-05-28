import { type ApplicationResponse } from '@logto/schemas';
import { Trans } from 'react-i18next';

import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import OrganizationList from '@/components/OrganizationList';
import { ApplicationDetailsTabs } from '@/consts';
import TabWrapper from '@/ds-components/TabWrapper';
import TextLink from '@/ds-components/TextLink';
import { organizations } from '@/hooks/use-console-routes/routes/organizations';

import MachineLogs from './MachineLogs';
import MachineToMachineApplicationRoles from './MachineToMachineApplicationRoles';
import styles from './index.module.scss';

type Props = {
  readonly application: ApplicationResponse;
  readonly activeTab?: string;
};

function MachineToMachineTabs({ application, activeTab }: Props) {
  return (
    <>
      <TabWrapper
        isActive={activeTab === ApplicationDetailsTabs.Roles}
        className={styles.tabContainer}
      >
        <MachineToMachineApplicationRoles application={application} />
      </TabWrapper>
      <TabWrapper
        isActive={activeTab === ApplicationDetailsTabs.Logs}
        className={styles.tabContainer}
      >
        <MachineLogs applicationId={application.id} />
      </TabWrapper>
      <TabWrapper
        isActive={activeTab === ApplicationDetailsTabs.Organizations}
        className={styles.tabContainer}
      >
        <OrganizationList
          type="application"
          data={application}
          placeholder={
            <EmptyDataPlaceholder
              title={
                <Trans
                  i18nKey="admin_console.application_details.no_organization_placeholder"
                  components={{ a: <TextLink to={'/' + organizations.path} /> }}
                />
              }
            />
          }
        />
      </TabWrapper>
    </>
  );
}

export default MachineToMachineTabs;
