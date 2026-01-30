import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const endpoint = 'https://api.smtp2go.com/v3/email/send';

export const defaultMetadata: ConnectorMetadata = {
    id: 'smtp2go-email-service',
    target: 'smtp2go-email',
    platform: null,
    name: {
        en: 'SMTP2GO Email',
        'zh-CN': 'SMTP2GO 邮件',
        de: 'SMTP2GO E-Mail',
    },
    logo: './logo.svg',
    logoDark: null,
    description: {
        en: 'SMTP2GO is a reliable email delivery service for transactional and marketing emails.',
        'zh-CN': 'SMTP2GO 是一个可靠的事务性和营销电子邮件服务。',
        de: 'SMTP2GO ist ein zuverlässiger E-Mail-Zustelldienst für transaktionale und Marketing-E-Mails.',
    },
    readme: './README.md',
    formItems: [
        {
            key: 'apiKey',
            label: 'API Key',
            type: ConnectorConfigFormItemType.Text,
            required: true,
            placeholder: '<your-smtp2go-api-key>',
        },
        {
            key: 'sender',
            label: 'Sender Email',
            type: ConnectorConfigFormItemType.Text,
            required: true,
            placeholder: 'noreply@example.com',
        },
        {
            key: 'senderName',
            label: 'Sender Name',
            type: ConnectorConfigFormItemType.Text,
            required: false,
            placeholder: 'Logto',
        },
        {
            key: 'templates',
            label: 'Templates',
            type: ConnectorConfigFormItemType.Json,
            required: true,
            defaultValue: [
                {
                    usageType: 'SignIn',
                    type: 'text/plain',
                    subject: 'Logto Sign-In Verification Code',
                    content:
                        'Your Logto sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
                },
                {
                    usageType: 'Register',
                    type: 'text/plain',
                    subject: 'Logto Registration Verification Code',
                    content:
                        'Your Logto sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
                },
                {
                    usageType: 'ForgotPassword',
                    type: 'text/plain',
                    subject: 'Logto Password Reset Verification Code',
                    content:
                        'Your Logto password reset verification code is {{code}}. The code will remain active for 10 minutes.',
                },
                {
                    usageType: 'OrganizationInvitation',
                    type: 'text/plain',
                    subject: 'Logto Organization Invitation',
                    content:
                        'You have been invited to join an organization. Your invitation link is {{link}}.',
                },
                {
                    usageType: 'Generic',
                    type: 'text/plain',
                    subject: 'Logto Verification Code',
                    content:
                        'Your Logto verification code is {{code}}. The code will remain active for 10 minutes.',
                },
                {
                    usageType: 'UserPermissionValidation',
                    type: 'text/plain',
                    subject: 'Logto Permission Validation Code',
                    content:
                        'Your Logto permission validation code is {{code}}. The code will remain active for 10 minutes.',
                },
                {
                    usageType: 'BindNewIdentifier',
                    type: 'text/plain',
                    subject: 'Logto New Identifier Binding Code',
                    content:
                        'Your Logto new identifier binding code is {{code}}. The code will remain active for 10 minutes.',
                },
                {
                    usageType: 'MfaVerification',
                    type: 'text/plain',
                    subject: 'Logto MFA Verification Code',
                    content:
                        'Your Logto MFA verification code is {{code}}. The code will remain active for 10 minutes.',
                },
                {
                    usageType: 'BindMfa',
                    type: 'text/plain',
                    subject: 'Logto 2-Step Verification Setup Code',
                    content:
                        'Your Logto 2-step verification setup code is {{code}}. The code will remain active for 10 minutes.',
                },
            ],
        },
    ],
};
