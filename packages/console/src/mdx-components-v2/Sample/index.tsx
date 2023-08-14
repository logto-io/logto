import { appendPath } from '@silverhand/essentials';
import { useContext } from 'react';

import { githubOrgLink } from '@/consts';
import { LinkButton } from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import Spacer from '@/ds-components/Spacer';
import { GuideContext } from '@/pages/Applications/components/GuideV2';

import * as styles from './index.module.scss';

/** The inline banner for displaying the sample info. */
export default function Sample() {
  const {
    metadata: { sample },
    Logo,
  } = useContext(GuideContext);

  if (!sample) {
    return null;
  }

  return (
    <aside className={styles.wrapper}>
      {Logo && (
        <div className={styles.logo}>
          <Logo />
        </div>
      )}
      <hgroup className={styles.hgroup}>
        <header>Want to see a sample?</header>
        <p>Check out our repository for a sample application that uses this guide.</p>
      </hgroup>
      <Spacer />
      <LinkButton
        type="outline"
        href={appendPath(new URL(githubOrgLink), sample.repo, 'tree/HEAD', sample.path).href}
        title={<DangerousRaw>Check out sample</DangerousRaw>}
        targetBlank="noopener"
      />
    </aside>
  );
}
