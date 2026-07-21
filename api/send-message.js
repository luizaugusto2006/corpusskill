export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        return res.status(500).json({ error: 'Twilio não configurado no servidor' });
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
                })
            }
        );

        const data = await response.json();

        if (data.sid) {
            return res.status(200).json({ success: true, messageId: data.sid });
        } else {
            return res.status(400).json({ 
                success: false, 
                error: data.message || data.error_message || 'Erro ao enviar mensagem' 
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: 'Erro de conexão com Twilio' 
        });
    }
}
