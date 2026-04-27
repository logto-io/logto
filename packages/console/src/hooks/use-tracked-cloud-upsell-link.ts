import type { OssUpsellEntry } from '@logto/schemas';
import { useState, type AnchorHTMLAttributes } from 'react';

import { createTrackedCloudUpsellLink, reportTrackedCloudUpsellClick } from '@/utils/oss-upsell';

type TrackedCloudUpsellLinkProps = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'onMouseEnter' | 'onFocus' | 'onContextMenu' | 'onClick' | 'onAuxClick'
>;

function useTrackedCloudUpsellLink(entry: OssUpsellEntry): TrackedCloudUpsellLinkProps {
  const [cloudUpsellLink, setCloudUpsellLink] = useState(() =>
    createTrackedCloudUpsellLink({
      entry,
    })
  );

  const refreshCloudUpsellLink = () => {
    const nextLink = createTrackedCloudUpsellLink({
      entry,
    });

    setCloudUpsellLink(nextLink);

    return nextLink;
  };

  const openFreshCloudUpsellLink = () => {
    const trackedLink = refreshCloudUpsellLink();

    reportTrackedCloudUpsellClick(entry, trackedLink);
    window.open(trackedLink.href, '_blank', 'noopener,noreferrer');
  };

  return {
    href: cloudUpsellLink.href,
    onMouseEnter: () => {
      refreshCloudUpsellLink();
    },
    onFocus: () => {
      refreshCloudUpsellLink();
    },
    onContextMenu: () => {
      refreshCloudUpsellLink();
    },
    onClick: (event) => {
      event.preventDefault();
      openFreshCloudUpsellLink();
    },
    onAuxClick: (event) => {
      if (event.button !== 1) {
        return;
      }

      event.preventDefault();
      openFreshCloudUpsellLink();
    },
  };
}

export default useTrackedCloudUpsellLink;
