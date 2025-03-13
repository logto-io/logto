import { Theme } from '@logto/schemas';
import { type FC } from 'react';

import useTheme from '@/hooks/use-theme';

type Props = {
  readonly Logo: FC;
  readonly LogoDark?: FC;
};

function CaptchaLogo({ Logo, LogoDark }: Props) {
  const theme = useTheme();

  if (theme === Theme.Dark && LogoDark) {
    return <LogoDark />;
  }

  return <Logo />;
}

export default CaptchaLogo;
