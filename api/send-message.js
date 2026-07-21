exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const { to, message } = JSON.parse(event.body || '{}');

    if (!to || !message) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Telefone e mensagem são obrigatórios' }) };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Twilio não configurado' }) };
    }

    try {
        const phone = to.replace(/\D/g, '');
        const formattedTo = phone.startsWith('55') ? `whatsapp:+${phone}` : `whatsapp:+55${phone}`;
        const formattedFrom = `whatsapp:+${fromNumber}`;
        const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    From: formattedFrom,
                    To: formattedTo,
                    Body: message
                }).toString()
            }
        );

        const data = await response.json();

        if (data.sid) {
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, messageId: data.sid }) };
        } else {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: data.message || 'Erro ao enviar' }) };
        }
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Erro de conexão' }) };
    }
};
