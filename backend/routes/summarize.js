const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

router.post('/', async (req, res) => {
  try {
    // Fetch todos from Supabase
    const { data: todos, error } = await supabase.from('todos').select('*');
    if (error) throw new Error('Error fetching todos: ' + error.message);

    const text = todos.map(t => `- ${t.text} (Priority: ${t.priority || 'N/A'}, Due: ${t.due_date || 'N/A'})`).join('\n');

    // Generate summary using Gemini
    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-pro-latest',
      contents: [{ role: 'user', parts: `Summarize these todos:\n${text}` }],
    });

    const summary = response.candidates[0].content.parts[0].text;

    // Post summary to Slack
    const slackRes = await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `📝 Todo Summary:\n${summary}`,
    });
    if (slackRes.status !== 200) throw new Error('Failed to post to Slack');

    res.json({ summary });

  } catch (error) {
    console.error("Summarize error details:", error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

module.exports = router;
