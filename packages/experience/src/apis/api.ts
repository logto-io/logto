import i18next from 'i18next';
import ky from 'ky';

import { kyPrefixUrl } from './const';

export default ky.extend({
  prefixUrl: kyPrefixUrl,
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('Accept-Language', i18next.language);
      },
    ],
  },
});
