import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

/** A write the assistant proposed. It only runs when the user confirms it here. */
export type ProposedAction = {
  readonly id: string;
  readonly tool: string;
  readonly body: Record<string, unknown>;
  readonly expiresAt: string;
  readonly status: 'pending' | 'running' | 'done' | 'cancelled' | 'failed';
  readonly message?: string;
};

type Props = {
  readonly action: ProposedAction;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
};

/** Shows the exact body of a proposed write, with Confirm and Cancel while it is pending. */
function ProposedActionCard({ action, onConfirm, onCancel }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const statusLabel = {
    running: t('inkeep_ai_bot.action_running'),
    done: t('inkeep_ai_bot.action_done'),
    cancelled: t('inkeep_ai_bot.action_cancelled'),
    failed: t('inkeep_ai_bot.action_failed'),
  };

  return (
    <div className={styles.actionCard}>
      <div className={styles.actionTitle}>
        {t('inkeep_ai_bot.action_proposed', { tool: action.tool })}
      </div>
      <pre className={styles.actionBody}>{JSON.stringify(action.body, null, 2)}</pre>
      {action.status === 'pending' ? (
        <div className={styles.actionButtons}>
          <button type="button" className={styles.actionConfirm} onClick={onConfirm}>
            {t('inkeep_ai_bot.action_confirm')}
          </button>
          <button type="button" className={styles.actionCancel} onClick={onCancel}>
            {t('inkeep_ai_bot.action_cancel')}
          </button>
        </div>
      ) : (
        <div className={styles.actionStatus}>{statusLabel[action.status]}</div>
      )}
      {action.message && <div className={styles.error}>{action.message}</div>}
    </div>
  );
}

export default ProposedActionCard;
