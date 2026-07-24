/* TE:BEGIN qr-push-factor */
/**
 * Same shape as `SecondaryPageLayout` (nav bar + title + description + body), but takes
 * plain strings instead of i18n keys, so the TripleEnable screens can carry their own
 * copy without adding entries to the shared phrases package.
 */

import { type ReactNode } from 'react';

import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import NavBar from '@/shared/components/NavBar';

import styles from './index.module.scss';

type Props = {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
};

const TeLayout = ({ title, description, children }: Props) => {
  const navigate = useNavigateWithPreservedSearchParams();

  return (
    <div className={styles.wrapper}>
      <NavBar
        onBack={() => {
          navigate(-1);
        }}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          {description && <div className={styles.description}>{description}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};

export default TeLayout;
/* TE:END qr-push-factor */
