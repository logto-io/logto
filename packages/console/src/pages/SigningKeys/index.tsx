import { LogtoOidcConfigKeyType } from '@logto/schemas';

import PageMeta from '@/components/PageMeta';
import { signingKeysLink } from '@/consts';
import CardTitle from '@/ds-components/CardTitle';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import SigningKeyFormCard from './SigningKeyFormCard';
import styles from './index.module.scss';

function SigningKeys() {
  const { getDocumentationUrl } = useDocumentationUrl();

  return (
    <div className={styles.container}>
      <PageMeta titleKey="signing_keys.title" />
      <CardTitle
        title="signing_keys.title"
        subtitle="signing_keys.description"
        learnMoreLink={{ href: getDocumentationUrl(signingKeysLink), targetBlank: 'noopener' }}
        className={styles.header}
      />
      <SigningKeyFormCard keyType={LogtoOidcConfigKeyType.PrivateKeys} />
      <SigningKeyFormCard keyType={LogtoOidcConfigKeyType.CookieKeys} />
    </div>
  );
}

export default SigningKeys;
