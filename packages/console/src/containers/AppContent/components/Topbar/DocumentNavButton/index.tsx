import DocumentIcon from '@/assets/images/document-nav-button.svg';
import DangerousRaw from '@/components/DangerousRaw';
import TextLink from '@/components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import * as styles from './index.module.scss';

function DocumentNavButton() {
  const { documentationSiteUrl } = useDocumentationUrl();
  return (
    <div className={styles.documentNavButton}>
      <DocumentIcon className={styles.icon} />
      <TextLink href={documentationSiteUrl} target="_blank" className={styles.textLink}>
        <DangerousRaw>Docs</DangerousRaw>
      </TextLink>
    </div>
  );
}

export default DocumentNavButton;
