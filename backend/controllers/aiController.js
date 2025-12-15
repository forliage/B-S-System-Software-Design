const OpenAI = require('openai');
const db = require('../config/db');

const getAIClient = (apiKey) => {
    return new OpenAI({
        apiKey: apiKey || process.env.AI_API_KEY,
    });
};

exports.chatSearch = async (req, res) => {
    try {
        const { query, apiKey } = req.body;
        if (!query) return res.status(400).json({ error: 'Query is required' });

        const userId = req.user.id;
        const [photos] = await db.query('SELECT photo_id, title, description, exif_time, exif_location FROM Photo WHERE user_id = ? ORDER BY upload_time DESC LIMIT 50', [userId]);

        const photoIds = photos.map(p => p.photo_id);
        let tagsMap = {};
        if (photoIds.length > 0) {
            const [tags] = await db.query('SELECT pt.photo_id, t.name FROM PhotoTag pt JOIN Tag t ON pt.tag_id = t.tag_id WHERE pt.photo_id IN (?)', [photoIds]);
            tags.forEach(t => {
                if (!tagsMap[t.photo_id]) tagsMap[t.photo_id] = [];
                tagsMap[t.photo_id].push(t.name);
            });
        }

        const context = photos.map(p => ({
            id: p.photo_id,
            desc: `Title: ${p.title}, Desc: ${p.description}, Tags: ${(tagsMap[p.photo_id] || []).join(', ')}, Date: ${p.exif_time}, Loc: ${p.exif_location}`
        }));

        const systemPrompt = `
You are a photo gallery assistant. User asks to find photos.
Available Photos Context:
${JSON.stringify(context)}

Return JSON format:
{
  "answer": "Text response to user",
  "photo_ids": [1, 2] // List of matching photo IDs
}
If no matching photos, photo_ids should be empty.
`;

        if (!apiKey && !process.env.AI_API_KEY) {
            return res.status(503).json({ error: 'AI Service currently unavailable (No API Key)' });
        }

        const openai = getAIClient(apiKey);
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query }
            ],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);

        let resultPhotos = [];
        if (result.photo_ids && result.photo_ids.length > 0) {
            const [rows] = await db.query('SELECT * FROM Photo WHERE photo_id IN (?)', [result.photo_ids]);
            resultPhotos = rows;
        }

        res.json({
            answer: result.answer,
            results: resultPhotos
        });

    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ error: 'AI processing failed', details: err.message });
    }
};

exports.autoTag = async (req, res) => {
    res.json({ message: "Auto-tagging not fully implemented in demo (requires Vision API key)" });
};
