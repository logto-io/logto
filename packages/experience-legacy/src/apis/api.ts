import i18next from 'i18next';
import ky from 'ky';

export default ky.extend({
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('Accept-Language', i18next.language);
      },
    ],
  },
});
