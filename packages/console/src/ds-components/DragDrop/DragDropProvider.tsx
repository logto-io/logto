import { conditionalString } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { createContext, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import * as styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
};

type DragDropContextProps = {
  isDragging: boolean;
  setIsDragging?: (value: boolean) => void;
};

export const DragDropContext = createContext<DragDropContextProps>({
  isDragging: false,
});

function DragDropProvider({ children }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const memorizedContext = useMemo(() => ({ isDragging, setIsDragging }), [isDragging]);

  return (
    <DragDropContext.Provider value={memorizedContext}>
      <DndProvider backend={HTML5Backend}>
        <div className={conditionalString(isDragging && styles.dragging)}>{children}</div>
      </DndProvider>
    </DragDropContext.Provider>
  );
}

export default DragDropProvider;
