# GatewayAPI SMS connector

The official Logto connector for GatewayAPI SMS.

## Get started

GatewayAPI is a cloud service provider in Europe, offering many cloud services, including SMS (short message service). GatewayAPI SMS Connector is a plugin provided by the Logto team to call the GatewayAPI SMS service, with the help of which Logto end-users can register and sign in to their Logto account via SMS verification code.

## Set up in GatewayAPI

> 💡 **Tip**
> 
> You can skip some sections if you have already finished.

### Create an GatewayAPI account

Go to the [GatewayAPI website](https://www.gatewayapi.com/) and register your GatewayAPI account if you don't have one.

### Enable account

You may need to enable your account before using the SMS service. You can contact the GatewayAPI customer service to enable your account.

### Get API token

Go to the API Keys page from the GatewayAPI console, and find the API token or create a new API token.

## Set up in Logto

1. **Endpoint**: If your GatewayAPI account is in the EU region, you should use the endpoint `https://gatewayapi.eu/rest/mtsms`. If your GatewayAPI account is in the US region, you should use the endpoint `https://gatewayapi.com/rest/mtsms`.
2. **API Token**: The API token you created in the previous step.
3. **Sender**: The sender you want to use to send the SMS.
4. **Templates**: The templates you want to use to send the SMS, you can use the default templates or modify them as needed.
