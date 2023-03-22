import { useState } from 'react';

import Gift from '@/assets/images/gift.svg';
import IconButton from '@/components/IconButton';

import GiftModal from './GiftModal';

function EarlyBirdGift() {
  const [isGiftOpen, setIsGiftOpen] = useState(false);

  return (
    <>
      <IconButton
        size="large"
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
