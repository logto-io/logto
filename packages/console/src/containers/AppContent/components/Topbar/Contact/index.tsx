import { useState } from 'react';

import ContactIcon from '@/assets/icons/contact-us.svg';
import IconButton from '@/ds-components/IconButton';

import ContactModal from './ContactModal';

function Contact() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <IconButton
        size="medium"
        onClick={() => {
          setIsContactOpen(true);
        }}
      >
        <ContactIcon />
      </IconButton>
      <ContactModal
        isOpen={isContactOpen}
        onCancel={() => {
          setIsContactOpen(false);
        }}
      />
    </>
  );
}

export default Contact;
