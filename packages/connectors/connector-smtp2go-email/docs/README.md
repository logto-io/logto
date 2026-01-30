# SMTP2GO Email Connector

## Overview

The SMTP2GO connector enables Logto to send transactional emails through the SMTP2GO email delivery service. This connector supports all standard Logto email templates including registration, sign-in, password reset, and more.

## Features

- ✅ Support for both plain text and HTML emails
- ✅ Template-based email sending
- ✅ Custom i18n template support
- ✅ Handlebar variable replacement (e.g., `{{code}}`, `{{link}}`)
- ✅ Verified sender support

## Prerequisites

1. An active SMTP2GO account ([Sign up here](https://www.smtp2go.com/))
2. A verified sender email address or domain
3. An SMTP2GO API key with "Send Email" permissions

## Configuration

See the main [README.md](../README.md) for detailed setup instructions.

### Required Configuration

- **apiKey**: Your SMTP2GO API key
- **sender**: Your verified sender email address
- **templates**: Array of email templates for different use cases

### Optional Configuration

- **senderName**: Friendly name to display as the email sender

## API Reference

This connector uses the SMTP2GO `/v3/email/send` API endpoint. For more information, see the [SMTP2GO API documentation](https://apidoc.smtp2go.com/documentation/).

## Development

### Install Dependencies

```bash
pnpm install
```

### Run Tests

```bash
pnpm test
```

### Build

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

## License

MPL-2.0
