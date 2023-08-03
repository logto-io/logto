import { useState, type RefObject, useEffect } from 'react';

const useTextOverflow = (textRef: RefObject<HTMLDivElement | HTMLAnchorElement>) => {
  const [isTextOverflow, setIsTextOverflow] = useState(false);

  useEffect(() => {
    if (!textRef.current) {
      return;
    }

    const text = textRef.current;

    setIsTextOverflow(text.scrollWidth > text.offsetWidth);

    const handleResize = () => {
      setIsTextOverflow(text.scrollWidth > text.offsetWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [textRef]);

  return {
    isTextOverflow,
  };
};

export default useTextOverflow;
