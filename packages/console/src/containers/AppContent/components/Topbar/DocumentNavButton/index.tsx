import classNames from 'classnames';

import DocumentIcon from '@/assets/icons/document-nav-button.svg';
import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import * as styles from './index.module.scss';

function DocumentNavButton() {
  const { documentationSiteUrl } = useDocumentationUrl();
  return (
    <TextLink
      href={documentationSiteUrl}
      target="_blank"
      className={classNames(styles.textLink, styles.documentNavButton)}
      icon={<DocumentIcon className={styles.icon} />}
    >
      {/* <DangerousRaw>Docs</DangerousRaw> */}
      <span>
        <DynamicT forKey="topbar.docs" />
      </span>
    </TextLink>
  );
}

export default DocumentNavButton;
