import { assert, conditional, trySafe } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
    GetConnectorConfig,
    SendMessageFunction,
    CreateConnector,
    EmailConnector,
    GetI18nEmailTemplate,
    EmailTemplateDetails,
    SendMessagePayload,
} from '@logto/connector-kit';
import {
    ConnectorError,
    ConnectorErrorCodes,
    validateConfig,
    ConnectorType,
    replaceSendMessageHandlebars,
    getConfigTemplateByType,
} from '@logto/connector-kit';

import { defaultMetadata, endpoint } from './constant.js';
import { ContentType, smtp2goEmailConfigGuard } from './types.js';
import type { Smtp2goEmailConfig, Smtp2goEmailRequest, Smtp2goEmailResponse } from './types.js';

const buildRequestFromDefaultTemplate = (
    to: string,
    config: Smtp2goEmailConfig,
    template: Smtp2goEmailConfig['templates'][0],
    payload: SendMessagePayload
): Smtp2goEmailRequest => {
    const subject = replaceSendMessageHandlebars(template.subject, payload);
    const content = replaceSendMessageHandlebars(template.content, payload);

    return {
        api_key: config.apiKey,
        to: [to],
        sender: config.senderName ? `${config.senderName} <${config.sender}>` : config.sender,
        subject,
        ...(template.type === ContentType.Html ? { html_body: content } : { text_body: content }),
    };
};

const buildRequestFromCustomTemplate = (
    to: string,
    config: Smtp2goEmailConfig,
    { subject, content, sendFrom, contentType = 'text/html' }: EmailTemplateDetails,
    payload: SendMessagePayload
): Smtp2goEmailRequest => {
    const processedSubject = replaceSendMessageHandlebars(subject, payload);
    const processedContent = replaceSendMessageHandlebars(content, payload);
    const senderName = sendFrom ? replaceSendMessageHandlebars(sendFrom, payload) : config.senderName;

    return {
        api_key: config.apiKey,
        to: [to],
        sender: senderName ? `${senderName} <${config.sender}>` : config.sender,
        subject: processedSubject,
        ...(contentType === 'text/html'
            ? { html_body: processedContent }
            : { text_body: processedContent }),
    };
};

const sendMessage =
    (
        getConfig: GetConnectorConfig,
        getI18nEmailTemplate?: GetI18nEmailTemplate
    ): SendMessageFunction =>
        async (data, inputConfig) => {
            const { to, type, payload } = data;
            const config = inputConfig ?? (await getConfig(defaultMetadata.id));
            validateConfig(config, smtp2goEmailConfigGuard);

            const customTemplate = await trySafe(async () => getI18nEmailTemplate?.(type, payload.locale));

            const template = getConfigTemplateByType(type, config);

            const requestPayload = customTemplate
                ? buildRequestFromCustomTemplate(to, config, customTemplate, payload)
                : template && buildRequestFromDefaultTemplate(to, config, template, payload);

            assert(requestPayload, new ConnectorError(ConnectorErrorCodes.TemplateNotFound));

            try {
                const response = await got.post<Smtp2goEmailResponse>(endpoint, {
                    json: requestPayload,
                    responseType: 'json',
                });

                // Check for errors in response
                if (response.body.data?.error) {
                    throw new ConnectorError(
                        ConnectorErrorCodes.General,
                        `SMTP2GO API Error: ${response.body.data.error} (${response.body.data.error_code || 'unknown'})`
                    );
                }

                return response;
            } catch (error: unknown) {
                if (error instanceof HTTPError) {
                    const {
                        response: { body: rawBody },
                    } = error;

                    assert(
                        typeof rawBody === 'string' || typeof rawBody === 'object',
                        new ConnectorError(
                            ConnectorErrorCodes.InvalidResponse,
                            `Invalid response raw body type: ${typeof rawBody}`
                        )
                    );

                    const errorMessage =
                        typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);

                    throw new ConnectorError(ConnectorErrorCodes.General, errorMessage);
                }

                // Re-throw if already a ConnectorError
                if (error instanceof ConnectorError) {
                    throw error;
                }

                throw new ConnectorError(ConnectorErrorCodes.General, error);
            }
        };

const createSmtp2goEmailConnector: CreateConnector<EmailConnector> = async ({
    getConfig,
    getI18nEmailTemplate,
}) => {
    return {
        metadata: defaultMetadata,
        type: ConnectorType.Email,
        configGuard: smtp2goEmailConfigGuard,
        sendMessage: sendMessage(getConfig, getI18nEmailTemplate),
    };
};

export default createSmtp2goEmailConnector;
