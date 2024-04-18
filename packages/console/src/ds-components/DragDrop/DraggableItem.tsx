import type { Nullable } from '@silverhand/essentials';
import type { Identifier } from 'dnd-core';
import type { ReactNode } from 'react';
import { useContext, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { DragDropContext } from './DragDropProvider';

type Props = {
  readonly id: string;
  readonly sortIndex: number;
  readonly moveItem: (dragIndex: number, hoverIndex: number) => void;
  readonly children: ReactNode;
  readonly dragType?: string;
  readonly className?: string;
};

type DragItemProps = {
  sortIndex: number;
  id: string;
  type: string;
};

function DraggableItem({
  id,
  children,
  sortIndex,
  moveItem,
  dragType = 'DraggableItem',
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { setIsDragging } = useContext(DragDropContext);
  const [{ handlerId }, drop] = useDrop<DragItemProps, void, { handlerId: Nullable<Identifier> }>({
    accept: dragType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItemProps, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.sortIndex;
      const hoverIndex = sortIndex;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      // eslint-disable-next-line @silverhand/fp/no-mutation
      item.sortIndex = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: dragType,
    item: () => {
      return { id, sortIndex };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  useEffect(() => {
    setIsDragging?.(isDragging);
  }, [setIsDragging, isDragging]);

  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId} className={className}>
      {children}
    </div>
  );
}

export default DraggableItem;
