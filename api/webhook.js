// Webhook para receber atualizações de status do WhatsApp
// Configurar no Meta Business Suite

export default async function handler(req, res) {
    // Verificação do webhook (GET)
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            console.log('Webhook verificado!');
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    }

    // Receber atualizações (POST)
    if (req.method === 'POST') {
        try {
            const body = req.body;

            if (body.object === 'whatsapp_business_account') {
                const entries = body.entry || [];
                
                for (const entry of entries) {
                    const changes = entry.changes || [];
                    
                    for (const change of changes) {
                        if (change.field === 'messages') {
                            const value = change.value;
                            
                            // Processar status de entrega
                            if (value.statuses) {
                                for (const status of value.statuses) {
                                    console.log(`Status da mensagem ${status.id}: ${status.status}`);
                                    // Aqui você pode salvar no banco de dados
                                }
                            }
                            
                            // Processar mensagens recebidas
                            if (value.messages) {
                                for (const msg of value.messages) {
                                    console.log(`Mensagem recebida de ${msg.from}: ${msg.text?.body}`);
                                    // Aqui você pode processar respostas automáticas
                                }
                            }
                        }
                    }
                }
            }

            return res.status(200).send('OK');
        } catch (error) {
            console.error('Erro no webhook:', error);
            return res.status(500).send('Erro interno');
        }
    }

    return res.status(405).send('Method not allowed');
}
