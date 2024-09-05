import classNames from 'classnames';
import type { OverlayScrollbarsComponentProps } from 'overlayscrollbars-react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useTranslation } from 'react-i18next';

function OverlayScrollbar(props: OverlayScrollbarsComponentProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <OverlayScrollbarsComponent
      options={{ scrollbars: { autoHide: 'leave', autoHideDelay: 0 } }}
      {...props}
      className={classNames(props.className, isRtl && 'os-scrollbar-rtl')}
    />
  );
}

export default OverlayScrollbar;
