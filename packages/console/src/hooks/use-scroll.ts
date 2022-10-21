import type { Nullable } from '@silverhand/essentials';
import { useState, useEffect, useCallback } from 'react';

const useScroll = (contentRef: Nullable<HTMLDivElement>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = useCallback(() => {
    if (!contentRef) {
      return;
    }
    const { scrollTop, scrollLeft } = contentRef;
    setScrollTop(scrollTop);
    setScrollLeft(scrollLeft);
  }, [contentRef]);

  useEffect(() => {
    if (!contentRef) {
      return;
    }

    contentRef.addEventListener('scroll', handleScroll);

    return () => {
      contentRef.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, contentRef]);

  return {
    scrollTop,
    scrollLeft,
  };
};

export default useScroll;
