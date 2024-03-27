import { SsoProviderName, SsoProviderType } from '@logto/schemas';

import OidcConnector from '../OidcConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { type SingleSignOn, type SingleSignOnConnectorData } from '../types/connector.js';
import {
  SsoConnectorError,
  SsoConnectorErrorCodes,
  SsoConnectorConfigErrorCodes,
} from '../types/error.js';
import { basicOidcConnectorConfigGuard } from '../types/oidc.js';

export class OidcSsoConnector extends OidcConnector implements SingleSignOn {
  constructor(readonly data: SingleSignOnConnectorData) {
    const parseConfigResult = basicOidcConnectorConfigGuard.safeParse(data.config);

    if (!parseConfigResult.success) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
        config: data.config,
        message: SsoConnectorConfigErrorCodes.InvalidConnectorConfig,
        error: parseConfigResult.error.flatten(),
      });
    }

    super(parseConfigResult.data);
  }

  async getConfig() {
    return this.getOidcConfig();
  }

  async getIssuer() {
    return this.issuer;
  }
}

export const oidcSsoConnectorFactory: SingleSignOnFactory<SsoProviderName.OIDC> = {
  providerName: SsoProviderName.OIDC,
  providerType: SsoProviderType.OIDC,
  logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzk5MTRfMjA2MTMpIj4KPHBhdGggZD0iTTI0IDEzLjc5OTJMMjMuNCA4LjM5OTIyTDIxLjY2IDkuNTM5MjJDMjAuMDQgOC41MTkyMiAxOCA3Ljc5OTIyIDE1LjcyIDcuNDM5MjJDMTUuNzIgNy40MzkyMiAxNC41OCA3LjE5OTIyIDEzLjA4IDcuMTk5MjJDMTEuNTggNy4xOTkyMiAxMC4yIDcuMzc5MjIgMTAuMiA3LjM3OTIyQzQuMzggOC4wOTkyMiAwIDExLjM5OTIgMCAxNS4zNTkyQzAgMTkuNDM5MiA0LjUgMjIuNzk5MiAxMS40IDIzLjM5OTJWMjEuMDU5MkM2LjY2IDIwLjM5OTIgMy42NiAxOC4xNzkyIDMuNjYgMTUuMzU5MkMzLjY2IDEyLjcxOTIgNi40MiAxMC40OTkyIDEwLjIgOS43NzkyMkMxMC4yIDkuNzc5MjIgMTMuMTQgOS4xMTkyMiAxNS43MiA5Ljg5OTIyQzE2Ljk4IDEwLjE5OTIgMTguMTIgMTAuNjE5MiAxOS4wOCAxMS4yMTkyTDE2LjggMTIuNTk5MkwyNCAxMy43OTkyWiIgZmlsbD0iIzlFOUU5RSIvPgo8cGF0aCBkPSJNMTEuMzk5OSAyLjM5OTYxVjIzLjM5OTZMMTQuOTk5OSAyMS41OTk2VjAuNTk5NjA5TDExLjM5OTkgMi4zOTk2MVoiIGZpbGw9IiNGRjk4MDAiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF85OTE0XzIwNjEzIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=',
  logoDark:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzk5MTRfMjA2MTIpIj4KPHBhdGggZD0iTTI0IDEzLjc5OTJMMjMuNCA4LjM5OTIyTDIxLjY2IDkuNTM5MjJDMjAuMDQgOC41MTkyMiAxOCA3Ljc5OTIyIDE1LjcyIDcuNDM5MjJDMTUuNzIgNy40MzkyMiAxNC41OCA3LjE5OTIyIDEzLjA4IDcuMTk5MjJDMTEuNTggNy4xOTkyMiAxMC4yIDcuMzc5MjIgMTAuMiA3LjM3OTIyQzQuMzggOC4wOTkyMiAwIDExLjM5OTIgMCAxNS4zNTkyQzAgMTkuNDM5MiA0LjUgMjIuNzk5MiAxMS40IDIzLjM5OTJWMjEuMDU5MkM2LjY2IDIwLjM5OTIgMy42NiAxOC4xNzkyIDMuNjYgMTUuMzU5MkMzLjY2IDEyLjcxOTIgNi40MiAxMC40OTkyIDEwLjIgOS43NzkyMkMxMC4yIDkuNzc5MjIgMTMuMTQgOS4xMTkyMiAxNS43MiA5Ljg5OTIyQzE2Ljk4IDEwLjE5OTIgMTguMTIgMTAuNjE5MiAxOS4wOCAxMS4yMTkyTDE2LjggMTIuNTk5MkwyNCAxMy43OTkyWiIgZmlsbD0iIzlFOUU5RSIvPgo8cGF0aCBkPSJNMTEuMzk5OSAyLjM5OTYxVjIzLjM5OTZMMTQuOTk5OSAyMS41OTk2VjAuNTk5NjA5TDExLjM5OTkgMi4zOTk2MVoiIGZpbGw9IiNGRjk4MDAiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF85OTE0XzIwNjEyIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=',
  description: {
    de: 'Modernes Protokoll auf Basis von OAuth 2.0 für Identitätsprüfung in Web- und Mobilanwendungen.',
    en: 'Modern protocol built on OAuth 2.0 for identity verification in web and mobile apps.',
    es: 'Protocolo moderno basado en OAuth 2.0 para verificación de identidad en aplicaciones web y móviles.',
    fr: "Protocole moderne basé sur OAuth 2.0 pour la vérification d'identité dans les applications web et mobiles.",
    it: "Protocollo moderno basato su OAuth 2.0 per la verifica dell'identità nelle applicazioni web e mobile.",
    ja: 'ウェブおよびモバイルアプリのアイデンティティ検証のための OAuth 2.0 に基づくモダンなプロトコル。',
    ko: '웹 및 모바일 앱에서 신원 확인을 위한 OAuth 2.0 기반의 현대적인 프로토콜.',
    'pl-PL':
      'Nowoczesny protokół oparty na OAuth 2.0 do weryfikacji tożsamości w aplikacjach webowych i mobilnych.',
    'pt-BR':
      'Protocolo moderno baseado em OAuth 2.0 para verificação de identidade em aplicativos web e móveis.',
    'pt-PT':
      'Protocolo moderno baseado em OAuth 2.0 para verificação de identidade em aplicações web e móveis.',
    ru: 'Современный протокол на основе OAuth 2.0 для проверки личности в веб- и мобильных приложениях.',
    'tr-TR': 'Web ve mobil uygulamalarda kimlik doğrulama için OAuth 2.0 tabanlı modern protokol.',
    'zh-CN': '在 Web 和移动应用中基于 OAuth 2.0 构建的现代协议，用于身份验证。',
    'zh-HK': '在 Web 和移動應用中基於 OAuth 2.0 構建的現代協議，用於身份驗證。',
    'zh-TW': '在 Web 和移動應用中基於 OAuth 2.0 構建的現代協議，用於身份驗證。',
  },
  name: {
    en: 'OIDC',
  },
  configGuard: basicOidcConnectorConfigGuard,
  constructor: OidcSsoConnector,
};
