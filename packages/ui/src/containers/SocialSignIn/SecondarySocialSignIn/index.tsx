import { useMemo, useState, useRef } from 'react';

import useNativeMessageListener from '@/hooks/use-native-message-listener';
import usePlatform from '@/hooks/use-platform';
import useSocial from '@/hooks/use-social';

import SocialSignInDropdown from '../SocialSignInDropdown';
import SocialSignInIconList from '../SocialSignInIconList';
import SocialSignInPopUp from '../SocialSignInPopUp';

export const defaultSize = 4;

type Props = {
  className?: string;
};

const SecondarySocialSignIn = ({ className }: Props) => {
  const { socialConnectors } = useSocial();
  const [showModal, setShowModal] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const { isMobile } = usePlatform();

  useNativeMessageListener();

  const isCollapsed = socialConnectors.length > defaultSize;

  const displayConnectors = useMemo(() => {
    if (isCollapsed) {
      return socialConnectors.slice(0, defaultSize - 1);
    }

    return socialConnectors;
  }, [socialConnectors, isCollapsed]);

  return (
    <>
      <SocialSignInIconList
        className={className}
        connectors={displayConnectors}
        hasMore={isCollapsed}
        moreButtonRef={moreButtonRef}
        onMoreButtonClick={() => {
          setShowModal(true);
        }}
      />
      {isCollapsed && isMobile && (
        <SocialSignInPopUp
          connectors={socialConnectors.slice(defaultSize - 1)}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
          }}
        />
      )}
      {isCollapsed && !isMobile && (
        <SocialSignInDropdown
          anchorRef={moreButtonRef}
          isOpen={showModal}
          connectors={socialConnectors.slice(defaultSize - 1)}
          onClose={() => {
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default SecondarySocialSignIn;
