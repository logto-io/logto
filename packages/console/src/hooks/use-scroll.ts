import { useState, useEffect, useCallback } from 'react';

const useScroll = (ref?: HTMLDivElement) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = useCallback(() => {
    if (!ref) {
      return;
    }
    const { scrollTop, scrollLeft } = ref;
    setScrollTop(scrollTop);
    setScrollLeft(scrollLeft);
  }, [ref]);

  useEffect(() => {
    if (!ref) {
      return;
    }

    ref.addEventListener('scroll', handleScroll);

    return () => {
      ref.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, ref]);

  return {
    scrollTop,
    scrollLeft,
  };
};

export default useScroll;
