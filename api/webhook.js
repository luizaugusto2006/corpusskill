exports.handler = async (event) => {
    const headers = { 'Access-Control-Allow-Origin': '*' };

    if (event.httpMethod === 'GET') {
        const params = new URLSearchParams(event.queryStringParameters || {});
        const mode = params.get('hub.mode');
        const token = params.get('hub.verify_token');
        const challenge = params.get('hub.challenge');

        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            return { statusCode: 200, body: challenge };
        }
        return { statusCode: 403, body: 'Forbidden' };
    }

    if (event.httpMethod === 'POST') {
        console.log('Webhook received:', event.body);
        return { statusCode: 200, body: 'OK' };
    }

    return { statusCode: 405, body: 'Method not allowed' };
};
