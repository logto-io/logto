import styles from './App.module.scss';
import DevPanel from './DevPanel';
import congratsDark from './assets/congrats-dark.svg';
import congrats from './assets/congrats.svg';
import type { UserInfo } from './types';

type Props = {
  readonly isDarkMode: boolean;
  readonly isDevPanelVisible: boolean;
  readonly clientId: string;
  readonly urlAppId?: string;
  readonly refreshToken: string;
  readonly idToken: string;
  readonly accessToken: string;
  readonly user: UserInfo;
  readonly onSignOut: () => void;
  readonly onToggleDevPanel: () => void;
};

const SuccessCard = ({
  isDarkMode,
  isDevPanelVisible,
  clientId,
  urlAppId,
  refreshToken,
  idToken,
  accessToken,
  user,
  onSignOut,
  onToggleDevPanel,
}: Props) => (
  <>
    {isDevPanelVisible && (
      <DevPanel
        clientId={clientId}
        urlAppId={urlAppId}
        refreshToken={refreshToken}
        idToken={idToken}
        accessToken={accessToken}
      />
    )}
    <div className={styles.successCard}>
      <img
        className={styles.congratsIcon}
        src={isDarkMode ? congratsDark : congrats}
        alt="Congrats"
      />
      <div className={styles.successTitle}>You&apos;ve successfully signed in the demo app.</div>
      <div className={styles.successSubtitle}>Here is your log in information:</div>
      <div className={styles.infoCard}>
        {user.email && (
          <div>
            Email: <span>{user.email}</span>
          </div>
        )}
        {user.username && !user.email && (
          <div>
            Username: <span>{user.username}</span>
          </div>
        )}
        <div>
          User ID: <span>{user.sub}</span>
        </div>
      </div>
      <button type="button" className={styles.button} onClick={onSignOut}>
        Sign out the demo app
      </button>
      <button type="button" className={styles.openDevPanel} onClick={onToggleDevPanel}>
        {isDevPanelVisible ? 'Close dev panel' : 'Open dev panel'}
      </button>
    </div>
  </>
);

export default SuccessCard;
