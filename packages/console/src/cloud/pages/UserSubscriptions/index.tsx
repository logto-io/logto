import { useSubscriptionEntry } from '@/cloud/hooks/use-user-subscriptions';
import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import { contactEmailLink } from '@/consts/external-links';
import AppBoundary from '@/containers/AppBoundary';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextLink from '@/ds-components/TextLink';

import layout from '../EnterpriseSubscription/index.module.scss';

import EnterpriseCoverage from './EnterpriseCoverage';
import PersonalSubscriptions from './PersonalSubscriptions';
import styles from './index.module.scss';

function UserSubscriptions() {
  const { enterprises } = useSubscriptionEntry();
  // Console SSO creation uses only the first Enterprise; never list other contracts as coverage.
  const enterprise = enterprises.data?.[0];
  return (
    <AppBoundary>
      <div className={layout.pageContainer}>
        <PageMeta titleKey="enterprise_subscription.page_title" />
        <Topbar hideTenantSelector hideTitle />
        <OverlayScrollbar className={layout.scrollable}>
          <div className={layout.wrapper}>
            <CardTitle
              title="enterprise_subscription.title"
              subtitle="enterprise_subscription.user_subscriptions.description"
            />
            <div className={styles.content}>
              {enterprises.error && (
                <InlineNotification
                  severity="error"
                  action="general.retry"
                  onClick={() => {
                    void enterprises.mutate();
                  }}
                >
                  {enterprises.error.message}
                </InlineNotification>
              )}
              {enterprise && (
                <FormCard
                  title="enterprise_subscription.subscription.enterprise_plan_title"
                  description="enterprise_subscription.user_subscriptions.enterprise_description"
                >
                  <EnterpriseCoverage enterprise={enterprise} />
                </FormCard>
              )}
              <PersonalSubscriptions />
              <TextLink href={contactEmailLink}>
                <DynamicT forKey="general.contact_us_action" />
              </TextLink>
            </div>
          </div>
        </OverlayScrollbar>
      </div>
    </AppBoundary>
  );
}

export default UserSubscriptions;
