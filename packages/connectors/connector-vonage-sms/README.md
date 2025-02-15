# Vonage SMS connector

The official Logto connector for Vonage SMS.

## Get started

Vonage is a global communications provider, offering robust cloud-based communication services, including SMS (short message service). The Vonage SMS Connector is a plugin provided by the Logto team to enable Logto end-users to register and sign in to their Logto account via SMS verification codes.

## Set up in Vonage

> 💡 **Tip**
> 
> You can skip this step if you have already completed them.

To work with this connector, you will need to [sign up for an account](https://developer.vonage.com/en/account/guides/dashboard-management#create-and-configure-a-vonage-account) in Vonage. This will give you an API key and secret that you can use to access the APIs through this connector.

Once you have an account, you can find your API key and API secret at the top of the Vonage API Dashboard.

And you may need to [rant a virtual number](https://developer.vonage.com/en/numbers/guides/number-management#rent-a-virtual-number) to send SMS messages.

See the [Vonage SMS API](https://developer.vonage.com/en/messaging/sms/overview) for more information.

## Set up in Logto

1. **API Key**: Your Vonage API key.
2. **API Secret**: Your Vonage API secret.
3. **Brand Name**: The brand name you want to use to send the SMS, this is also called the `from` field, see the [Sender Identity](https://developer.vonage.com/en/messaging/sms/guides/custom-sender-id) for more information.
4. **Templates**: The templates you want to use to send the SMS, you can use the default templates or modify them as needed.
