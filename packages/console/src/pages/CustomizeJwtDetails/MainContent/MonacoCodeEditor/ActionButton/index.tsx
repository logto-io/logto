import { useCallback, useRef, useState, type MouseEventHandler, useEffect } from 'react';

import IconButton from '@/ds-components/IconButton';
import { Tooltip } from '@/ds-components/Tip';

type Props = {
  readonly actionTip: string;
  readonly actionSuccessTip: string;
  readonly actionLoadingTip?: string;
  readonly className?: string;
  readonly icon: React.ReactNode;
  readonly onClick: () => Promise<void> | void;
};

function ActionButton({
  actionTip,
  actionSuccessTip,
  actionLoadingTip,
  className,
  icon,
  onClick,
}: Props) {
  const [tipContent, setTipContent] = useState(actionTip);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mouseLeaveHandler = () => {
      setTipContent(actionTip);
    };

    iconButtonRef.current?.addEventListener('mouseleave', mouseLeaveHandler);

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- iconButtonRef.current is not a dependency
      iconButtonRef.current?.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  });

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(async () => {
    iconButtonRef.current?.blur();

    if (actionLoadingTip) {
      setTipContent(actionLoadingTip);
    }

    await onClick();
    setTipContent(actionSuccessTip);
  }, [actionLoadingTip, actionSuccessTip, onClick]);

  return (
    <div className={className}>
      <Tooltip content={tipContent} isSuccessful={tipContent === actionSuccessTip}>
        <IconButton ref={iconButtonRef} size="small" onClick={handleClick}>
          {icon}
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default ActionButton;
