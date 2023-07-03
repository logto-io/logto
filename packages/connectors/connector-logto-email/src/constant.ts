import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'logto-email',
  target: 'logto-email',
  platform: null,
  name: {
    en: 'Logto Built-in Email',
    de: 'Logto Integrierte E-mail',
    es: 'Logto Correo Electrónico Incorporado',
    fr: 'Logto Email Intégré',
    it: 'Logto Email Incorporata',
    ja: 'Logto 組み込みメール',
    ko: 'Logto 내장 이메일',
    'pl-PL': 'Logto Wbudowany Email',
    'pt-BR': 'Logto Email Incorporado',
    'pt-PT': 'Logto Email Incorporado',
    ru: 'Logto Встроенная электронная почта',
    'tr-TR': 'Logto Yerleşik E-posta',
    'zh-CN': 'Logto 内置电子邮件',
    'zh-HK': 'Logto 內置電子郵件',
    'zh-TW': 'Logto 內建電子郵件',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'A stable, free-to-use solution that requires no configuration and uses trustworthy service providers (e.g. SendGrid) for reliable email delivery.',
    de: 'Eine stabile, kostenlose Lösung, die keine Konfiguration erfordert und vertrauenswürdige Dienstleister (z. B. SendGrid) für zuverlässige E-Mail-Zustellung nutzt.',
    es: 'Una solución estable y gratuita que no requiere configuración y utiliza proveedores de servicios confiables (por ejemplo, SendGrid) para la entrega confiable de correos electrónicos.',
    fr: "Une solution stable et gratuite ne nécessitant aucune configuration et utilisant des fournisseurs de services fiables (par exemple, SendGrid) pour une livraison d'e-mails fiable.",
    it: 'Una soluzione stabile e gratuita che non richiede configurazione e utilizza provider di servizi affidabili (come SendGrid) per la consegna affidabile delle email.',
    ja: '安定した設定不要で信頼性の高いメール配信のために信頼できるサービスプロバイダ（例：SendGrid）を使用した、無料で利用できるソリューション。',
    ko: '구성 없이 안정적인 이메일 전송을 위해 신뢰할 수 있는 서비스 제공업체 (예: SendGrid) 를 사용하는 안정적이고 무료로 사용할 수 있는 솔루션입니다.',
    'pl-PL':
      'Stabilne, bezpłatne rozwiązanie, które nie wymaga konfiguracji i korzysta z zaufanych dostawców usług (np. SendGrid) do niezawodnej dostawy wiadomości e-mail.',
    'pt-BR':
      'Uma solução estável e gratuita que não requer configuração e utiliza provedores de serviços confiáveis (por exemplo, SendGrid) para a entrega confiável de e-mails.',
    'pt-PT':
      'Uma solução estável e gratuita que não requer configuração e utiliza prestadores de serviços confiáveis (por exemplo, SendGrid) para a entrega fiável de emails.',
    ru: 'Надежное и бесплатное решение, не требующее настройки и использующее надежных провайдеров услуг (например, SendGrid) для надежной доставки электронной почты.',
    'tr-TR':
      'Yapılandırma gerektirmeyen ve güvenilir e-posta teslimatı için güvenilir hizmet sağlayıcılarını (örneğin SendGrid) kullanan istikrarlı ve ücretsiz kullanıma sahip bir çözüm.',
    'zh-CN':
      '一种稳定、免费使用的解决方案，无需配置，并使用可信赖的服务提供商（例如 SendGrid）进行可靠的电子邮件传递。',
    'zh-HK':
      '一個穩定、免費使用的解決方案，無需配置，並使用可信賴的服務提供商（例如 SendGrid）進行可靠的電子郵件傳遞。',
    'zh-TW':
      '一個穩定、免費使用的解決方案，無需配置，並利用可信賴的服務提供者（例如 SendGrid）提供可靠的電子郵件傳遞。',
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
      key: 'fromName',
      label: 'From Name',
      type: ConnectorConfigFormItemType.Text,
    },
    {
      key: 'companyAddress',
      label: 'Company Address',
      type: ConnectorConfigFormItemType.Text,
    },
    {
      key: 'appLogo',
      label: 'App Logo',
      type: ConnectorConfigFormItemType.Text,
    },
  ],
};

export const scope = ['send:email'];

export const defaultTimeout = 5000;

export const emailEndpoint = '/services/mails';

export const usageEndpoint = '/services/mails/usage';
