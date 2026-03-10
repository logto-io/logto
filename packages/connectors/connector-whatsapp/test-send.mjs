import { got } from 'got';

const accessToken = 'EAANm1iDdnyEBQxp6FNons21Lg7bDoUfZCyFeVwSlzWD0RSf7sXc7ayNPCiN0KpOT8qXowYYq9ZAc0U796Mg0kuRGHSc8F9uyDYySNHLb7kObZCqsBGnp3CpebRCxwslIa3I6DZCVG3VOVkqPaHRP5hClrsgUBASTZAvGlZAZAWML42ePdM0RUczLuwjs7oZAI0lxrZATxrkpbDQd7JxWtkfd0HR0s1COZCWSLBiHLWBk4tux5AvZCY5aDK4AuTZCalms0FZAl0CzZAht7qIQGeakxXIBwLVmkwTDjGjhxikvQZD';
const phoneNumberId = '362652486938968';
const destinatario = '+542302563594';

try {
    const response = await got.post(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            json: {
                messaging_product: 'whatsapp',
                to: destinatario,
                type: 'template',
                template: {
                    name: 'hello_world',
                    language: { code: 'en' },
                    components: [
                        {
                            type: 'body',
                            parameters: [{ type: 'text', text: '123456' }],
                        },
                        {
                            type: 'button',
                            sub_type: 'url',
                            index: '0',
                            parameters: [{ type: 'text', text: '123456' }],
                        },
                    ],
                },
            },
        }
    );
    console.log('✅ Mensaje enviado:', response.body);
} catch (error) {
    console.log('❌ Error:', error.response?.body ?? error.message);
}