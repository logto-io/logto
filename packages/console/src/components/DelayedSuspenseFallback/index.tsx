import { useState, useEffect } from 'react';

import { Daisy } from '@/ds-components/Spinner';

import styles from './index.module.scss';

const suspenseDisplayTimeout = 500; // Milliseconds

/**
 * Displays a spinner after a short delay (500ms) to prevent flashing
 * @returns {JSX.Element} The spinner
 */
function DelayedSuspenseFallback() {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShowSpinner(true);
    }, suspenseDisplayTimeout);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (showSpinner) {
    return <Daisy className={styles.daisy} />;
  }

  return null;
}

export default DelayedSuspenseFallback;
