export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
        return res.status(500).json({ error: 'GROQ_API_KEY belum dikonfigurasi di Vercel.' });
    }

    try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${groqKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.6,
                max_tokens: 4096
            })
        });

        const groqData = await groqRes.json();
        
        if (groqRes.ok && groqData.choices?.[0]?.message?.content) {
            return res.status(200).json({ 
                result: groqData.choices[0].message.content, 
                engine: 'Groq Llama-3' 
            });
        } else {
            return res.status(500).json({ error: groqData.error?.message || 'Gagal memproses via Groq.' });
        }
    } catch (e) {
        return res.status(500).json({ error: 'Terjadi kesalahan server: ' + e.message });
    }
}
