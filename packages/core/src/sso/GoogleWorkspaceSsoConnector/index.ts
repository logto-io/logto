import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { type SsoConnector, SsoProviderName } from '@logto/schemas';

import OidcConnector from '../OidcConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { type CreateSingleSignOnSession, type SingleSignOn } from '../types/index.js';
import { basicOidcConnectorConfigGuard } from '../types/oidc.js';

// Google use static issue endpoint.
const googleIssuer = 'https://accounts.google.com';

export class GoogleWorkspaceSsoConnector extends OidcConnector implements SingleSignOn {
  static googleIssuer = googleIssuer;

  constructor(readonly data: SsoConnector) {
    const parseConfigResult = googleWorkspaceSsoConnectorConfigGuard.safeParse(data.config);

    if (!parseConfigResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, parseConfigResult.error);
    }

    super({
      ...parseConfigResult.data,
      issuer: googleIssuer,
    });
  }

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
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMy41MiAxMi4yNzI5QzIzLjUyIDExLjQyMiAyMy40NDM2IDEwLjYwMzggMjMuMzAxOCA5LjgxODM2SDEyVjE0LjQ2MDJIMTguNDU4MkMxOC4xOCAxNS45NjAyIDE3LjMzNDUgMTcuMjMxMSAxNi4wNjM2IDE4LjA4MlYyMS4wOTI5SDE5Ljk0MThDMjIuMjEwOSAxOS4wMDM4IDIzLjUyIDE1LjkyNzUgMjMuNTIgMTIuMjcyOVoiIGZpbGw9IiM0Mjg1RjQiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMiAyMy45OTk5QzE1LjI0IDIzLjk5OTkgMTcuOTU2NCAyMi45MjU0IDE5Ljk0MTggMjEuMDkyNkwxNi4wNjM2IDE4LjA4MTdDMTQuOTg5MSAxOC44MDE3IDEzLjYxNDUgMTkuMjI3MiAxMiAxOS4yMjcyQzguODc0NTUgMTkuMjI3MiA2LjIyOTA5IDE3LjExNjMgNS4yODU0NiAxNC4yNzk5SDEuMjc2MzdWMTcuMzg5QzMuMjUwOTEgMjEuMzEwOCA3LjMwOTA5IDIzLjk5OTkgMTIgMjMuOTk5OVoiIGZpbGw9IiMzNEE4NTMiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01LjI4NTQ1IDE0LjI3OThDNS4wNDU0NSAxMy41NTk4IDQuOTA5MDkgMTIuNzkwNyA0LjkwOTA5IDExLjk5OThDNC45MDkwOSAxMS4yMDg5IDUuMDQ1NDUgMTAuNDM5OCA1LjI4NTQ1IDkuNzE5ODFWNi42MTA3MkgxLjI3NjM2QzAuNDYzNjM2IDguMjMwNzIgMCAxMC4wNjM0IDAgMTEuOTk5OEMwIDEzLjkzNjIgMC40NjM2MzYgMTUuNzY4OSAxLjI3NjM2IDE3LjM4ODlMNS4yODU0NSAxNC4yNzk4WiIgZmlsbD0iI0ZCQkMwNSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEyIDQuNzcyNzNDMTMuNzYxOCA0Ljc3MjczIDE1LjM0MzYgNS4zNzgxOCAxNi41ODczIDYuNTY3MjdMMjAuMDI5MSAzLjEyNTQ1QzE3Ljk1MDkgMS4xODkwOSAxNS4yMzQ1IDAgMTIgMEM3LjMwOTA5IDAgMy4yNTA5MSAyLjY4OTA5IDEuMjc2MzcgNi42MTA5MUw1LjI4NTQ2IDkuNzJDNi4yMjkwOSA2Ljg4MzY0IDguODc0NTUgNC43NzI3MyAxMiA0Ljc3MjczWiIgZmlsbD0iI0VBNDMzNSIvPgo8L3N2Zz4K',
    description: {
      en: 'This connector is used to connect with Google Workspace Single Sign-On.',
    },
    configGuard: googleWorkspaceSsoConnectorConfigGuard,
    constructor: GoogleWorkspaceSsoConnector,
  };
