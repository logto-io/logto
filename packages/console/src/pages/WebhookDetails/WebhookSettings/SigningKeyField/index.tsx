import { type Hook } from '@logto/schemas';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Redo from '@/assets/icons/redo.svg';
import Button from '@/ds-components/Button';
import ConfirmModal from '@/ds-components/ConfirmModal';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

type Props = {
  readonly hookId: string;
  readonly signingKey: string;
  readonly onSigningKeyUpdated: (signingKey: string) => void;
};

function SigningKeyField({ hookId, signingKey, onSigningKeyUpdated }: Props) {
  const { t } = useTranslation(undefined);
  const api = useApi();
  const [isRegenerateFormOpen, setIsRegenerateFormOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const regenerateSigningKey = useCallback(
    async (silent = false) => {
      if (isRegenerating) {
        return;
      }
      setIsRegenerating(true);
      try {
        const { signingKey } = await api.patch(`api/hooks/${hookId}/signing-key`).json<Hook>();
        if (!silent) {
          toast.success(t('admin_console.webhook_details.settings.regenerated'));
        }
        setIsRegenerateFormOpen(false);
        onSigningKeyUpdated(signingKey);
      } finally {
        setIsRegenerating(false);
      }
    },
    [api, hookId, isRegenerating, onSigningKeyUpdated, t]
  );

  useEffect(() => {
    if (!signingKey) {
      void regenerateSigningKey(true);
    }
  }, [regenerateSigningKey, signingKey]);

  return (
    <FormField
      title="webhook_details.settings.signing_key"
      tip={<DynamicT forKey="webhook_details.settings.signing_key_tip" />}
    >
      <CopyToClipboard
        hasVisibilityToggle
        value={signingKey}
        variant="border"
        className={styles.signingKeyField}
      />
      <Button
        type="text"
        size="small"
        icon={<Redo />}
        title="webhook_details.settings.regenerate"
        className={styles.regenerateButton}
        onClick={() => {
          setIsRegenerateFormOpen(true);
        }}
      />
      <ConfirmModal
        isOpen={isRegenerateFormOpen}
        isLoading={isRegenerating}
        confirmButtonText="webhook_details.settings.regenerate"
        title="webhook_details.settings.regenerate_key_title"
        onCancel={async () => {
          setIsRegenerateFormOpen(false);
        }}
        onConfirm={async () => regenerateSigningKey()}
      >
        <DynamicT forKey="webhook_details.settings.regenerate_key_reminder" />
      </ConfirmModal>
    </FormField>
  );
}

export default SigningKeyField;
