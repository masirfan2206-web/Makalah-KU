export default async function handler(req, res) {
    // Hanya izinkan method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    // Cek apakah API Key sudah ada di Vercel Environment Variables
    if (!apiKey) {
        return res.status(500).json({ 
            error: 'GEMINI_API_KEY belum diatur di Environment Variables Vercel.' 
        });
    }

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || 'Gagal menghubungi server Gemini AI.' 
            });
        }

        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.status(200).json({ result: textResult });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
