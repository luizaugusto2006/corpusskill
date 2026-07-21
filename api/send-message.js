// API para envio de mensagens via WhatsApp Cloud API
// Deploy no Vercel Functions ou qualquer plataforma serverless

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { to, message, token, phoneId } = req.body;

    if (!to || !message) {
        return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }

    if (!token || !phoneId) {
        return res.status(400).json({ error: 'Token e Phone ID são obrigatórios' });
    }

    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${phoneId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: to.replace(/\D/g, ''),
                    type: 'text',
                    text: {
                        body: message
                    }
                })
            }
        );

        const data = await response.json();

        if (data.messages) {
            return res.status(200).json({ 
                success: true, 
                messageId: data.messages[0].id 
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                error: data.error?.message || 'Erro ao enviar mensagem' 
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: 'Erro de conexão com a API do WhatsApp' 
        });
    }
}
