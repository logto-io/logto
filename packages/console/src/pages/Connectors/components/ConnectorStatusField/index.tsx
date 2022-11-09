import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Tip from '@/assets/images/tip.svg';
import ToggleTip from '@/components/ToggleTip';
import { onKeyDownHandler } from '@/utilities/a11y';

import * as styles from './index.module.scss';

const ConnectorStatusField = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isTipOpen, setIsTipOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.field}>
      {t('connectors.connector_status')}
      <div ref={anchorRef} className={styles.tipIcon}>
        <Tip
          tabIndex={0}
          onClick={() => {
            setIsTipOpen(true);
          }}
          onKeyDown={onKeyDownHandler(() => {
            setIsTipOpen(true);
          })}
        />
      </div>
      <ToggleTip
        isOpen={isTipOpen}
        anchorRef={anchorRef}
        position="top"
        horizontalAlign="center"
        onClose={() => {
          setIsTipOpen(false);
        }}
      >
        <div className={styles.title}>{t('connectors.connector_status')}</div>
        <div className={styles.content}>
          <Trans
            components={{
              a: (
                <Link
                  to="/sign-in-experience/sign-up-and-sign-in"
                  target="_blank"
                  onClick={() => {
                    setIsTipOpen(false);
                  }}
                />
              ),
            }}
          >
            {t('connectors.not_in_use_tip.content', {
              link: t('connectors.not_in_use_tip.go_to_sie'),
            })}
          </Trans>
        </div>
      </ToggleTip>
    </div>
  );
};

export default ConnectorStatusField;
