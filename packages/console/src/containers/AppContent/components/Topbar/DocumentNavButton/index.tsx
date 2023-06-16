import DocumentIcon from '@/assets/icons/document-nav-button.svg';
import DangerousRaw from '@/ds-components/DangerousRaw';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import * as styles from './index.module.scss';

function DocumentNavButton() {
  const { documentationSiteUrl } = useDocumentationUrl();
  return (
    <div className={styles.documentNavButton}>
      <TextLink
        href={documentationSiteUrl}
        target="_blank"
        className={styles.textLink}
        icon={<DocumentIcon className={styles.icon} />}
      >
        <DangerousRaw>Docs</DangerousRaw>
      </TextLink>
    </div>
  );
}

export default DocumentNavButton;
