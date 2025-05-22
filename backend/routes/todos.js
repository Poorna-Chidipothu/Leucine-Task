const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // console.log("Sending todos to frontend:", data); 
    res.json(data);
  } catch (err) {
    console.error("Error fetching todos:", err.message);
    res.status(500).json({ error: err.message });
  }
});



router.post('/', async (req, res) => {
  try {
    const { text, priority, dueDate } = req.body;

    if (!text || !priority) {
      return res.status(400).json({ error: 'Text and priority are required.' });
    }

    const due = dueDate && dueDate.trim() !== '' ? dueDate : null;

    const newTodo = {
      id: uuidv4(),
      text,
      priority,
      ...(due ? { due_date: due } : {})
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
    const { text, priority, dueDate, completed } = req.body;

    if (!text || !priority) {
      return res.status(400).json({ error: 'Text and priority are required.' });
    }

    const due = dueDate && dueDate.trim() !== '' ? dueDate : null;

    const updatedTodo = {
      text,
      priority,
      ...(due ? { due_date: due } : { due_date: null }),
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
    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting todo:', err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;