import { useLayoutEffect, useRef, useState } from 'react';

// Recalculate the height of the editor when the container size changes
// This is to avoid the code editor's height shaking when the content is updated.
// @see {@link https://github.com/react-monaco-editor/react-monaco-editor/issues/391}
const useEditorHeight = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [editorHeight, setEditorHeight] = useState<number | string>('100%');
  const safeArea = 16;

  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setEditorHeight(containerRef.current.clientHeight - safeArea);
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { containerRef, editorHeight };
};

export default useEditorHeight;
