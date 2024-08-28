import { MfaFactor } from '@logto/schemas';
import { t } from 'i18next';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import Button from '@/components/Button';
import DynamicT from '@/components/DynamicT';
import useSendMfaPayload from '@/hooks/use-send-mfa-payload';
import useTextHandler from '@/hooks/use-text-handler';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { backupCodeBindingStateGuard } from '@/types/guard';
import { isNativeWebview } from '@/utils/native-sdk';

import * as styles from './index.module.scss';

const BackupCodeBinding = () => {
  const { copyText, downloadText } = useTextHandler();
  const sendMfaPayload = useSendMfaPayload();

  const { state } = useLocation();
  const [, backupCodeBindingState] = validate(state, backupCodeBindingStateGuard);

  if (!backupCodeBindingState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { codes } = backupCodeBindingState;
  const backupCodeTextContent = codes.join('\n');

  return (
    <SecondaryPageLayout
      isNavBarHidden
      title="mfa.save_backup_code"
      description="mfa.save_backup_code_description"
    >
      <div className={styles.container}>
        <div className={styles.backupCodes}>
          {codes.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </div>
        <div className={styles.actions}>
          {!isNativeWebview() && (
            <Button
              title="action.download"
              type="secondary"
              onClick={() => {
                downloadText(backupCodeTextContent, 'backup_code.txt');
              }}
            />
          )}
          <Button
            title="action.copy"
            type="secondary"
            onClick={() => {
              void copyText(backupCodeTextContent, t('mfa.backup_code_copied'));
            }}
          />
        </div>
        <div className={styles.hint}>
          <DynamicT forKey="mfa.backup_code_hint" />
        </div>
        <Button
          title="action.continue"
          onClick={() => {
            void sendMfaPayload({
              flow: UserMfaFlow.MfaBinding,
              payload: { type: MfaFactor.BackupCode },
            });
          }}
        />
      </div>
    </SecondaryPageLayout>
  );
};

export default BackupCodeBinding;
