// Maya (MyAI) — Groq API proxy.
// GROQ_API_KEY mühit dəyişəni Vercel-də təyin olunmalıdır.
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'GROQ_API_KEY mühit dəyişəni təyin olunmayıb.' });
        return;
    }

    const { messages, tools } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 80) {
        res.status(400).json({ error: 'Yanlış sorğu formatı.' });
        return;
    }

    try {
        const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.MAYA_MODEL || 'llama-3.3-70b-versatile',
                messages,
                tools: Array.isArray(tools) ? tools : undefined,
                tool_choice: 'auto',
                temperature: 0.2,
                max_tokens: 1024,
            }),
        });

        const data = await upstream.json();
        if (!upstream.ok) {
            const detail = (data && data.error && data.error.message) || 'AI xidmətində xəta.';
            res.status(upstream.status).json({ error: detail });
            return;
        }
        res.status(200).json(data);
    } catch (e) {
        res.status(502).json({ error: 'AI xidmətinə qoşulmaq mümkün olmadı.' });
    }
}
