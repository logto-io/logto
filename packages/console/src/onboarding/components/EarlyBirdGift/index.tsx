import { useState } from 'react';

import Gift from '@/assets/icons/gift.svg';
import IconButton from '@/ds-components/IconButton';

import GiftModal from './GiftModal';
import * as styles from './index.module.scss';

function EarlyBirdGift() {
  const [isGiftOpen, setIsGiftOpen] = useState(false);

  return (
    <>
      <IconButton
        size="medium"
        className={styles.giftButton}
        onClick={() => {
          setIsGiftOpen(true);
        }}
      >
        <Gift />
      </IconButton>
      <GiftModal
        isOpen={isGiftOpen}
        onClose={() => {
          setIsGiftOpen(false);
        }}
      />
    </>
  );
}

export default EarlyBirdGift;
