import type { OverlayScrollbarsComponentProps } from 'overlayscrollbars-react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

function OverlayScrollbar(props: OverlayScrollbarsComponentProps) {
  return (
    <OverlayScrollbarsComponent
      options={{ scrollbars: { autoHide: 'leave', autoHideDelay: 0 } }}
      {...props}
    />
  );
}

export default OverlayScrollbar;
