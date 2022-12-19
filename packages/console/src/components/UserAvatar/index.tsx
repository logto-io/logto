import { AppearanceMode } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';

import DarkAvatar from '@/assets/images/default-avatar-dark.svg';
import LightAvatar from '@/assets/images/default-avatar-light.svg';
import { useTheme } from '@/hooks/use-theme';

import ImageWithErrorFallback from '../ImageWithErrorFallback';

type Props = {
  className?: string;
  url?: Nullable<string>;
};

const UserAvatar = ({ className, url }: Props) => {
  const theme = useTheme();
  const DefaultAvatar = theme === AppearanceMode.LightMode ? LightAvatar : DarkAvatar;

  if (url) {
    return (
      <ImageWithErrorFallback
        className={className}
        src={url}
        alt="avatar"
        /**
         * Some social connectors like Google will block the references to its image resource,
         * without specifying the referrerPolicy attribute. Reference:
         * https://stackoverflow.com/questions/40570117/http403-forbidden-error-when-trying-to-load-img-src-with-google-profile-pic
         */
        referrerPolicy="no-referrer"
      />
    );
  }

  return <DefaultAvatar className={className} />;
};

export default UserAvatar;
