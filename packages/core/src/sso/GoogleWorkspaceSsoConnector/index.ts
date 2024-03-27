import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { SsoProviderName, SsoProviderType } from '@logto/schemas';

import OidcConnector from '../OidcConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { type SingleSignOn, type SingleSignOnConnectorData } from '../types/connector.js';
import { basicOidcConnectorConfigGuard } from '../types/oidc.js';
import { type CreateSingleSignOnSession } from '../types/session.js';

// Google use static issue endpoint.
const googleIssuer = 'https://accounts.google.com';

export class GoogleWorkspaceSsoConnector extends OidcConnector implements SingleSignOn {
  static googleIssuer = googleIssuer;

  constructor(readonly data: SingleSignOnConnectorData) {
    const parseConfigResult = googleWorkspaceSsoConnectorConfigGuard.safeParse(data.config);

    if (!parseConfigResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, parseConfigResult.error);
    }

    super({
      ...parseConfigResult.data,
      issuer: googleIssuer,
    });
  }

  // Always use select_account prompt for Google Workspace SSO.
  override async getAuthorizationUrl(
    payload: { state: string; redirectUri: string; connectorId: string },
    setSession: CreateSingleSignOnSession
  ) {
    return super.getAuthorizationUrl(payload, setSession, 'select_account');
  }

  async getConfig() {
    return this.getOidcConfig();
  }

  async getIssuer() {
    return this.issuer;
  }
}

export const googleWorkspaceSsoConnectorConfigGuard = basicOidcConnectorConfigGuard.omit({
  issuer: true,
});

export const googleWorkSpaceSsoConnectorFactory: SingleSignOnFactory<SsoProviderName.GOOGLE_WORKSPACE> =
  {
    providerName: SsoProviderName.GOOGLE_WORKSPACE,
    providerType: SsoProviderType.OIDC,
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMy41MiAxMi4yNzI5QzIzLjUyIDExLjQyMiAyMy40NDM2IDEwLjYwMzggMjMuMzAxOCA5LjgxODM2SDEyVjE0LjQ2MDJIMTguNDU4MkMxOC4xOCAxNS45NjAyIDE3LjMzNDUgMTcuMjMxMSAxNi4wNjM2IDE4LjA4MlYyMS4wOTI5SDE5Ljk0MThDMjIuMjEwOSAxOS4wMDM4IDIzLjUyIDE1LjkyNzQgMjMuNTIgMTIuMjcyOVYxMi4yNzI5WiIgZmlsbD0iIzQyODVGNCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEyIDIzLjk5OTNDMTUuMjQgMjMuOTk5MyAxNy45NTY0IDIyLjkyNDggMTkuOTQxOCAyMS4wOTJMMTYuMDYzNiAxOC4wODExQzE0Ljk4OTEgMTguODAxMSAxMy42MTQ1IDE5LjIyNjYgMTIgMTkuMjI2NkM4Ljg3NDU1IDE5LjIyNjYgNi4yMjkwOSAxNy4xMTU3IDUuMjg1NDYgMTQuMjc5M0gxLjI3NjM3VjE3LjM4ODRDMy4yNTA5MSAyMS4zMTAyIDcuMzA5MDkgMjMuOTk5MyAxMiAyMy45OTkzVjIzLjk5OTNaIiBmaWxsPSIjMzRBODUzIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNS4yODU0NSAxNC4yODA0QzUuMDQ1NDUgMTMuNTYwNCA0LjkwOTA5IDEyLjc5MTMgNC45MDkwOSAxMi4wMDA0QzQuOTA5MDkgMTEuMjA5NSA1LjA0NTQ1IDEwLjQ0MDQgNS4yODU0NSA5LjcyMDQyVjYuNjExMzNIMS4yNzYzNkMwLjQ2MzYzNiA4LjIzMTMzIDAgMTAuMDY0MSAwIDEyLjAwMDRDMCAxMy45MzY4IDAuNDYzNjM2IDE1Ljc2OTUgMS4yNzYzNiAxNy4zODk1TDUuMjg1NDUgMTQuMjgwNFYxNC4yODA0WiIgZmlsbD0iI0ZCQkMwNSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEyIDQuNzcyNzNDMTMuNzYxOCA0Ljc3MjczIDE1LjM0MzYgNS4zNzgxOCAxNi41ODczIDYuNTY3MjdMMjAuMDI5MSAzLjEyNTQ1QzE3Ljk1MDkgMS4xODkwOSAxNS4yMzQ1IDAgMTIgMEM3LjMwOTA5IDAgMy4yNTA5MSAyLjY4OTA5IDEuMjc2MzcgNi42MTA5MUw1LjI4NTQ2IDkuNzJDNi4yMjkwOSA2Ljg4MzY0IDguODc0NTUgNC43NzI3MyAxMiA0Ljc3MjczVjQuNzcyNzNaIiBmaWxsPSIjRUE0MzM1Ii8+Cjwvc3ZnPgo=',
    logoDark:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMy41MiAxMi4yNzI5QzIzLjUyIDExLjQyMiAyMy40NDM2IDEwLjYwMzggMjMuMzAxOCA5LjgxODM2SDEyVjE0LjQ2MDJIMTguNDU4MkMxOC4xOCAxNS45NjAyIDE3LjMzNDUgMTcuMjMxMSAxNi4wNjM2IDE4LjA4MlYyMS4wOTI5SDE5Ljk0MThDMjIuMjEwOSAxOS4wMDM4IDIzLjUyIDE1LjkyNzQgMjMuNTIgMTIuMjcyOVYxMi4yNzI5WiIgZmlsbD0iIzQyODVGNCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEyIDI0LjAwMDNDMTUuMjQgMjQuMDAwMyAxNy45NTY0IDIyLjkyNTcgMTkuOTQxOCAyMS4wOTNMMTYuMDYzNiAxOC4wODIxQzE0Ljk4OTEgMTguODAyMSAxMy42MTQ1IDE5LjIyNzUgMTIgMTkuMjI3NUM4Ljg3NDU1IDE5LjIyNzUgNi4yMjkwOSAxNy4xMTY2IDUuMjg1NDYgMTQuMjgwM0gxLjI3NjM3VjE3LjM4OTRDMy4yNTA5MSAyMS4zMTEyIDcuMzA5MDkgMjQuMDAwMyAxMiAyNC4wMDAzVjI0LjAwMDNaIiBmaWxsPSIjMzRBODUzIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNS4yODU0NSAxNC4yNzk0QzUuMDQ1NDUgMTMuNTU5NCA0LjkwOTA5IDEyLjc5MDQgNC45MDkwOSAxMS45OTk0QzQuOTA5MDkgMTEuMjA4NSA1LjA0NTQ1IDEwLjQzOTQgNS4yODU0NSA5LjcxOTQ0VjYuNjEwMzVIMS4yNzYzNkMwLjQ2MzYzNiA4LjIzMDM1IDAgMTAuMDYzMSAwIDExLjk5OTRDMCAxMy45MzU4IDAuNDYzNjM2IDE1Ljc2ODUgMS4yNzYzNiAxNy4zODg1TDUuMjg1NDUgMTQuMjc5NFYxNC4yNzk0WiIgZmlsbD0iI0ZCQkMwNSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEyIDQuNzcyNzNDMTMuNzYxOCA0Ljc3MjczIDE1LjM0MzYgNS4zNzgxOCAxNi41ODczIDYuNTY3MjdMMjAuMDI5MSAzLjEyNTQ1QzE3Ljk1MDkgMS4xODkwOSAxNS4yMzQ1IDAgMTIgMEM3LjMwOTA5IDAgMy4yNTA5MSAyLjY4OTA5IDEuMjc2MzcgNi42MTA5MUw1LjI4NTQ2IDkuNzJDNi4yMjkwOSA2Ljg4MzY0IDguODc0NTUgNC43NzI3MyAxMiA0Ljc3MjczVjQuNzcyNzNaIiBmaWxsPSIjRUE0MzM1Ii8+Cjwvc3ZnPgo=',
    description: {
      de: 'Vereinheitlichte und sichere Verwaltung des Benutzerzugriffs innerhalb des Google-Ökosystems.',
      en: 'Unified and secure management of user access within the Google ecosystem.',
      es: 'Gestión unificada y segura del acceso de usuarios dentro del ecosistema de Google.',
      fr: "Gestion unifiée et sécurisée de l'accès utilisateur au sein de l'écosystème Google.",
      it: "Gestione unificata e sicura dell'accesso degli utenti all'interno dell'ecosistema Google.",
      ja: 'Google エコシステム内でのユーザーアクセスの統合およびセキュアな管理。',
      ko: 'Google 생태계 내에서 사용자 액세스의 통합 및 안전한 관리.',
      'pl-PL': 'Zintegrowane i bezpieczne zarządzanie dostępem użytkownika w ekosystemie Google.',
      'pt-BR':
        'Gerenciamento unificado e seguro do acesso do usuário dentro do ecossistema do Google.',
      'pt-PT': 'Gestão unificada e segura do acesso do utilizador no ecossistema Google.',
      ru: 'Единое и безопасное управление доступом пользователей в экосистеме Google.',
      'tr-TR': 'Google ekosistemi içinde kullanıcı erişiminin birleşik ve güvenli yönetimi.',
      'zh-CN': '在 Google 生态系统内统一且安全地管理用户访问。',
      'zh-HK': '在 Google 生態系統內統一且安全地管理用戶訪問。',
      'zh-TW': '在 Google 生態系統內統一且安全地管理用戶訪問。',
    },
    name: {
      en: 'Google Workspace',
    },
    configGuard: googleWorkspaceSsoConnectorConfigGuard,
    constructor: GoogleWorkspaceSsoConnector,
  };
