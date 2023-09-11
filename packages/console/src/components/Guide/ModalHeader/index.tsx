import { type AdminConsoleKey } from '@logto/phrases';
import { useCallback, useState } from 'react';

import Box from '@/assets/icons/box.svg';
import Close from '@/assets/icons/close.svg';
import { githubIssuesLink } from '@/consts';
import { isCloud } from '@/consts/env';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import IconButton from '@/ds-components/IconButton';
import Spacer from '@/ds-components/Spacer';

import RequestForm from './RequestForm';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  subtitle: AdminConsoleKey;
  buttonText: AdminConsoleKey;
  requestFormTitle?: AdminConsoleKey;
  requestFormFieldLabel: AdminConsoleKey;
  requestFormFieldPlaceholder: AdminConsoleKey;
  requestSuccessMessage: AdminConsoleKey;
  onClose: () => void;
};

function ModalHeader({
  title,
  subtitle,
  buttonText,
  requestFormTitle = buttonText,
  requestFormFieldLabel,
  requestFormFieldPlaceholder,
  requestSuccessMessage,
  onClose,
}: Props) {
  const [isRequestGuideOpen, setIsRequestGuideOpen] = useState(false);
  const onRequestGuideClose = useCallback(() => {
    setIsRequestGuideOpen(false);
  }, []);

  return (
    <div className={styles.header}>
      <IconButton size="large" onClick={onClose}>
        <Close className={styles.closeIcon} />
      </IconButton>
      <div className={styles.separator} />
      <CardTitle size="small" title={title} subtitle={subtitle} />
      <Spacer />
      <Button
        className={styles.requestSdkButton}
        type="outline"
        icon={<Box />}
        title={buttonText}
        onClick={() => {
          if (isCloud) {
            setIsRequestGuideOpen(true);
          } else {
            window.open(githubIssuesLink, '_blank');
          }
        }}
      />
      {isCloud && (
        <RequestForm
          title={requestFormTitle}
          successMessage={requestSuccessMessage}
          fieldLabel={requestFormFieldLabel}
          fieldPlaceholder={requestFormFieldPlaceholder}
          isOpen={isRequestGuideOpen}
          onClose={onRequestGuideClose}
        />
      )}
    </div>
  );
}

export default ModalHeader;
