import express from 'express';
import { CohereClient } from 'cohere-ai';
import supabase from '../services/supabaseClient.js';
import axios from 'axios';

const router = express.Router();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

router.post('/', async (req, res) => {
  try {
    const { data: todos, error } = await supabase
  .from('todos')
  .select('*')
  .eq('completed', false);

if (error) throw new Error('Error fetching todos: ' + error.message);

const text = todos
  .map(t => `- ${t.text}`)
  .join('\n');

const response = await cohere.chat({
  model: 'command-r',
  message: `Please review the following list of pending todos and provide a concise, well-structured summary in a single paragraph. Do not use bullet points. Organize the summary by priority, emphasizing the most urgent tasks first, but keep the flow natural and easy to read:\n${text}`
});

const summary = response.text || 'No summary generated.';
    // Send to Slack
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `📜 Todo Summary:\n${summary}`,
    });

    res.json({ summary });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

export default router;
