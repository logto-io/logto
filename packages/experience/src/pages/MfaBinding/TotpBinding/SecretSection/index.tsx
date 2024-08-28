import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import SectionLayout from '@/Layout/SectionLayout';
import Button from '@/components/Button';
import TextLink from '@/components/TextLink';
import usePlatform from '@/hooks/use-platform';
import useTextHandler from '@/hooks/use-text-handler';
import { type TotpBindingState } from '@/types/guard';

import * as styles from './index.module.scss';

const SecretSection = ({ secret, secretQrCode }: TotpBindingState) => {
  const { t } = useTranslation();
  const { isMobile } = usePlatform();
  const [isQrCodeFormat, setIsQrCodeFormat] = useState(!isMobile);
  const { copyText } = useTextHandler();

  return (
    <SectionLayout
      title="mfa.step"
      titleProps={{
        step: 1,
        content: t(isQrCodeFormat ? 'mfa.scan_qr_code' : 'mfa.copy_and_paste_key'),
      }}
      description={
        isQrCodeFormat ? 'mfa.scan_qr_code_description' : 'mfa.copy_and_paste_key_description'
      }
    >
      <div className={styles.secretContent}>
        {isQrCodeFormat && secretQrCode && (
          <div className={styles.qrCode}>
            <img src={secretQrCode} alt="QR code" />
          </div>
        )}
        {!isQrCodeFormat && (
          <div className={styles.copySecret}>
            <div className={styles.rawSecret}>{secret}</div>
            <Button
              title="action.copy"
              type="secondary"
              onClick={() => {
                void copyText(secret, t('mfa.secret_key_copied'));
              }}
            />
          </div>
        )}
        <TextLink
          text={isQrCodeFormat ? 'mfa.qr_code_not_available' : 'mfa.want_to_scan_qr_code'}
          onClick={() => {
            setIsQrCodeFormat(!isQrCodeFormat);
          }}
        />
      </div>
    </SectionLayout>
  );
};

export default SecretSection;
