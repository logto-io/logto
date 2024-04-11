import { SsoProviderName, SsoProviderType } from '@logto/schemas';

import { OidcSsoConnector } from '../OidcSsoConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { basicOidcConnectorConfigGuard } from '../types/oidc.js';

import { logoBase64, logoDarkBase64 } from './consts.js';

export class OktaSsoConnector extends OidcSsoConnector {}

export const oktaSsoConnectorFactory: SingleSignOnFactory<SsoProviderName.OKTA> = {
  providerName: SsoProviderName.OKTA,
  providerType: SsoProviderType.OIDC,
  logo: logoBase64,
  logoDark: logoDarkBase64,
  description: {
    de: 'Zentralisiertes Identitätsmanagement für Kunden, Mitarbeiter und Partner.',
    en: 'Centralizes identity management for customers, employees, and partners.',
    es: 'Gestión centralizada de identidad para clientes, empleados y socios.',
    fr: "Gestion centralisée de l'identité pour les clients, les employés et les partenaires.",
    it: "Gestione centralizzata dell'identità per clienti, dipendenti e partner.",
    ja: '顧客、従業員、パートナーのためのアイデンティティ管理の集中化。',
    ko: '고객, 직원 및 파트너를 위한 신원 관리의 중앙화.',
    'pl-PL': 'Centralizacja zarządzania tożsamością dla klientów, pracowników i partnerów.',
    'pt-BR': 'Centraliza a gestão de identidade para clientes, funcionários e parceiros.',
    'pt-PT': 'Centraliza a gestão de identidade para clientes, funcionários e parceiros.',
    ru: 'Централизованное управление идентификацией для клиентов, сотрудников и партнеров.',
    'tr-TR': 'Müşteriler, çalışanlar ve ortaklar için kimlik yönetimini merkezileştirir.',
    'zh-CN': '集中管理客户、员工和合作伙伴的身份。',
    'zh-HK': '集中管理客戶、員工和合作夥伴的身份。',
    'zh-TW': '集中管理客戶、員工和合作夥伴的身份。',
  },
  name: {
    en: 'Okta',
  },
  configGuard: basicOidcConnectorConfigGuard,
  constructor: OktaSsoConnector,
};
