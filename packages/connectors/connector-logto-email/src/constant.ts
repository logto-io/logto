import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'logto-email',
  target: 'logto-email',
  platform: null,
  name: {
    en: 'Logto email service',
    de: 'Logto e-mail-dienst',
    es: 'Servicio de correo electrónico de Logto',
    fr: 'Service de messagerie électronique Logto',
    it: 'Servizio di posta elettronica Logto',
    ja: 'Logto メールサービス',
    ko: 'Logto 이메일 서비스',
    'pl-PL': 'Usługa poczty elektronicznej Logto',
    'pt-BR': 'Serviço de e-mail do Logto',
    'pt-PT': 'Serviço de email do Logto',
    ru: 'Сервис электронной почты Logto',
    'tr-TR': 'Logto e-posta hizmeti',
    'zh-CN': 'Logto 邮件服务',
    'zh-HK': 'Logto 電郵服務',
    'zh-TW': 'Logto 電子郵件服務',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'An out-of-the-box email solution, completely free to use, guaranteeing  reliable email delivery.',
    de: 'Eine sofort einsatzbereite E-Mail-Lösung, vollständig kostenlos und garantiert zuverlässige E-Mail-Zustellung.',
    es: 'Una solución de correo electrónico lista para usar, completamente gratuita y garantizando una entrega de correo confiable.',
    fr: "Une solution de messagerie clé en main, totalement gratuite à utiliser, garantissant une livraison d'e-mails fiable.",
    it: "Una soluzione di posta elettronica pronta all'uso, completamente gratuita e che garantisce una consegna affidabile delle e-mail.",
    ja: '即座に利用可能なメールソリューションで、完全に無料で信頼性の高いメール配信を保証します。',
    ko: '즉시 사용 가능한 이메일 솔루션으로 완전히 무료이며 신뢰할 수 있는 이메일 전송을 보장합니다.',
    'pl-PL':
      'Gotowe do użycia rozwiązanie pocztowe, całkowicie darmowe, gwarantujące niezawodną dostawę wiadomości e-mail.',
    'pt-BR':
      'Uma solução de e-mail pronta para uso, totalmente gratuita e garantindo uma entrega de e-mail confiável.',
    'pt-PT':
      'Uma solução de email pronta a usar, completamente gratuita, garantindo uma entrega de email fiável.',
    ru: 'Готовое к использованию электронное письмо, полностью бесплатное и гарантирующее надежную доставку писем.',
    'tr-TR':
      'Kullanıma hazır, tamamen ücretsiz, güvenilir e-posta iletimi sağlayan bir e-posta çözümü.',
    'zh-CN': '一款开箱即用的电子邮件解决方案，完全免费使用，保证可靠的电子邮件投递。',
    'zh-HK': '一個即插即用的電子郵件解決方案，完全免費使用，保證可靠的電子郵件傳遞。',
    'zh-TW': '一個開箱即用的電子郵件解決方案，完全免費使用，保證可靠的電子郵件傳遞。',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'tokenEndpoint',
      label: 'Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'endpoint',
      label: 'Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'resource',
      label: 'Resource',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'appId',
      label: 'App ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'appSecret',
      label: 'App Secret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'senderName',
      label: 'Sender Name',
      type: ConnectorConfigFormItemType.Text,
    },
    {
      key: 'companyInformation',
      label: 'Company Information',
      type: ConnectorConfigFormItemType.Text,
    },
    {
      key: 'appLogo',
      label: 'App Logo',
      type: ConnectorConfigFormItemType.Text,
    },
  ],
  /**
   * This is the email address that will be used as the sender of the email, should align with
   * the `fromEmail` of emailServiceProvider stored in cloud.systems table.
   */
  fromEmail: 'no-reply@logto.email',
};

export const scope = ['send:email'];

export const defaultTimeout = 5000;

export const emailEndpoint = '/services/mails';

export const usageEndpoint = '/services/mails/usage';
