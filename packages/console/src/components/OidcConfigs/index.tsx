import SigningKeysFormCard from './SigningKeysFormCard';
import styles from './index.module.scss';

function OidcConfigs() {
  return (
    <div className={styles.container}>
      <SigningKeysFormCard />
    </div>
  );
}

export default OidcConfigs;
