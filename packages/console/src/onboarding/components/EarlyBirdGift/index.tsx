import { useState } from 'react';

import Gift from '@/assets/icons/gift.svg';
import IconButton from '@/ds-components/IconButton';

import GiftModal from './GiftModal';

function EarlyBirdGift() {
  const [isGiftOpen, setIsGiftOpen] = useState(false);

  return (
    <>
      <IconButton
        size="medium"
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
