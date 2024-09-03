import { type AdminConsoleKey } from '@logto/phrases';
import { useCallback, useState } from 'react';

import Box from '@/assets/icons/box.svg?react';
import { githubIssuesLink } from '@/consts';
import { isCloud } from '@/consts/env';
import Button from '@/ds-components/Button';
import DsModalHeader from '@/ds-components/ModalHeader';

import RequestForm from './RequestForm';
import styles from './index.module.scss';

type Props = {
  readonly title: AdminConsoleKey;
  readonly subtitle: AdminConsoleKey;
  readonly buttonText: AdminConsoleKey;
  readonly requestFormTitle?: AdminConsoleKey;
  readonly requestFormFieldLabel: AdminConsoleKey;
  readonly requestFormFieldPlaceholder: AdminConsoleKey;
  readonly requestSuccessMessage: AdminConsoleKey;
  readonly onClose: () => void;
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
    <>
      <DsModalHeader
        title={title}
        subtitle={subtitle}
        actionButton={
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
        }
        onClose={onClose}
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
    </>
  );
}

export default ModalHeader;
