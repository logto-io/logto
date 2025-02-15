import { type ReactNode } from 'react';

import { contactEmailLink } from '@/consts';
import { LinkButton } from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
  readonly onClickUpgrade?: () => void;
  readonly isContactUsPreferred?: boolean;
};

function QuotaGuardFooter({ children, isLoading, onClickUpgrade, isContactUsPreferred }: Props) {
  const { navigate } = useTenantPathname();

  return (
    <div className={styles.container}>
      <div className={styles.description}>{children}</div>
      <LinkButton
        size="large"
        type="primary"
        {...(isContactUsPreferred
          ? {
              title: 'general.contact_us_action',
              href: contactEmailLink,
              targetBlank: 'noopener',
            }
          : {
              title: 'upsell.upgrade_plan',
              isLoading,
              onClick: () => {
                if (onClickUpgrade) {
                  onClickUpgrade();
                  return;
                }
                // Navigate to subscription page by default
                navigate('/tenant-settings/subscription');
              },
            })}
      />
    </div>
  );
}

export default QuotaGuardFooter;
