import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../services/supabaseClient.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching todos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Todo is required.' });
    }

    const newTodo = {
      id: uuidv4(),
      text,
    };

    const { data, error } = await supabase.from('todos').insert([newTodo]).select();
    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error adding todo:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Todo is required.' });
    }


    const updatedTodo = {
      text,
      ...(typeof completed === 'boolean' ? { completed } : {})
    };

    const { data, error } = await supabase
      .from('todos')
      .update(updatedTodo)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error("Error updating todo:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: todo, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (!todo?.completed) {
      return res.status(400).json({ error: 'Only completed todos can be deleted.' });
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error("Error deleting todo:", err.message);
    res.status(500).json({ error: err.message });
  }
});


export default router;
