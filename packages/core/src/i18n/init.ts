import i18next from 'i18next';
import resources from '@logto/phrases';

export default async function initI18n() {
  await i18next.init({
    lng: 'en',
    resources,
  });
}
