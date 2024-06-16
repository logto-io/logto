import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet';

import PageContext from '@/Providers/PageContextProvider/PageContext';

type Props = {
  /** @see {@link https://developers.google.com/identity/gsi/web/reference/html-reference#data-context | Sign In With Google HTML API reference} */
  readonly context: 'signin' | 'signup';
};

/**
 * A component that renders the Google One Tap script if it is enabled in the experience settings.
 */
const GoogleOneTap = ({ context }: Props) => {
  const { experienceSettings } = useContext(PageContext);

  if (!experienceSettings?.googleOneTap?.isEnabled) {
    return null;
  }

  return (
    <>
      <Helmet>
        <script async src="https://accounts.google.com/gsi/client" />
      </Helmet>
      {createPortal(
        <div
          id="g_id_onload"
          data-client_id={experienceSettings.googleOneTap.clientId}
          data-context={context}
          data-login_uri={`${window.location.origin}/callback/${experienceSettings.googleOneTap.connectorId}`}
          data-auto_select={Boolean(experienceSettings.googleOneTap.autoSelect)}
          data-cancel_on_tap_outside={Boolean(experienceSettings.googleOneTap.closeOnTapOutside)}
          data-itp_support={Boolean(experienceSettings.googleOneTap.itpSupport)}
        />,
        document.body
      )}
    </>
  );
};

export default GoogleOneTap;
