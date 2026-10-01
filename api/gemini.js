export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
        return res.status(500).json({ error: 'API Key belum dikonfigurasi di Vercel.' });
    }

    // 1. UTAMA: Panggil Groq Llama-3 (Super Cepat)
    if (groqKey) {
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
            }
        } catch (e) {
            console.warn("Groq gagal, mencoba Gemini...", e);
        }
    }

    // 2. CADANGAN: Gemini Flash
    if (geminiKey) {
        try {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const geminiData = await geminiRes.json();
            if (geminiRes.ok && geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
                return res.status(200).json({ 
                    result: geminiData.candidates[0].content.parts[0].text, 
                    engine: 'Gemini Flash' 
                });
            }
        } catch (e) {
            console.error("Gemini gagal...", e);
        }
    }

    return res.status(500).json({ error: 'Gagal menghubungkan ke AI. Cek API Key di Vercel.' });
}
