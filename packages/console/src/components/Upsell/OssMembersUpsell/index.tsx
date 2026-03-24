import { LinkButton } from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';

import styles from './index.module.scss';

const features = [
  'Invite unlimited team members',
  'Role-based access control for team',
  'Manage invitations and permissions',
  'Audit logs for team activities',
];

function CheckIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.667 5L7.5 14.167 3.333 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OssMembersUpsell() {
  return (
    <div className={styles.container}>
      <div className={styles.illustration}>
        <div className={styles.avatars}>
          <div className={`${styles.avatar} ${styles.avatarA}`}>A</div>
          <div className={`${styles.avatar} ${styles.avatarB}`}>B</div>
          <div className={`${styles.avatar} ${styles.avatarC}`}>C</div>
        </div>
      </div>
      <div className={styles.title}>Team Collaboration</div>
      <div className={styles.subtitle}>
        Invite team members to manage your Logto project together. Assign roles and control
        permissions with ease.
      </div>
      <div className={styles.featureList}>
        {features.map((feature) => (
          <div key={feature} className={styles.featureItem}>
            <CheckIcon className={styles.checkIcon} />
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <div className={styles.ctaArea}>
        <LinkButton
          type="branding"
          size="large"
          title={<DangerousRaw>Explore Logto Cloud</DangerousRaw>}
          href="https://cloud.logto.io"
          targetBlank="noopener"
        />
        <a
          className={styles.compareLink}
          href="https://logto.io/pricing"
          target="_blank"
          rel="noopener"
        >
          {'Compare Cloud vs OSS \u2192'}
        </a>
      </div>
    </div>
  );
}

export default OssMembersUpsell;
