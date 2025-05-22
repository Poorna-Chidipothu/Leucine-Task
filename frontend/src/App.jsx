import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil, Trash } from 'lucide-react';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [summary, setSummary] = useState('');
  const [message, setMessage] = useState(null);
  const [editId, setEditId] = useState(null);

  const fetchTodos = async () => {
    try {
      const res = await axios.get('/api/todos');
      // console.log("API response:", res.data);
      setTodos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const addTodo = async () => {
    if (!text) return;
    try {
      if (editId) {
        await axios.put(`/api/todos/${editId}`, { text, priority, dueDate });
        toast.success("Todo updated successfully!");
      } else {
        await axios.post('/api/todos', { text, priority, dueDate });
        toast.success("Todo added successfully!");
      }
      setText('');
      setPriority('Medium');
      setDueDate('');
      setEditId(null);
      fetchTodos();
    } catch {
      toast.error("Error saving todo.");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      toast.success("Todo deleted successfully!");
      fetchTodos();
    } catch {
      toast.error("Failed to delete todo.");
    }
  };

  const summarize = async () => {
    try {
      const res = await axios.post('/api/summarize');
      setSummary(res.data.summary);
      toast.success("Summary sent to Slack!");
    } catch (e) {
      toast.error("Failed to send summary.");
    }
  };

  const startEdit = (todo) => {
    setText(todo.text);
    setPriority(todo.priority);
    setDueDate(todo.due_date);
    setEditId(todo.id);
  };

  const toggleComplete = async (todo) => {
    try {
      await axios.put(`/api/todos/${todo.id}`, {
        ...todo,
        completed: !todo.completed
      });
      fetchTodos();
    } catch {
      toast.error("Failed to toggle completion.");
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="App min-h-screen w-full bg-orange-50 p-6 flex justify-center items-start">
      <ToastContainer />
      <div className="min-w-[450px] bg-white p-6 shadow-2xl flex flex-col rounded-xl mt-20">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">Todo Summary Assistant</h1>

        <div className="bg-white p-4 rounded shadow mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Task description"
            value={text}
            onChange={e => setText(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <div className="flex w-full gap-2">
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="border p-2 rounded w-1/3"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="border p-2 rounded w-1/3"
            />
            <button
              onClick={addTodo}
              className="bg-orange-500 text-white px-4 py-2 rounded w-1/3 cursor-pointer"
            >
              {editId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>

        <ul className="mb-4">
          {todos.map(todo => (
            <li key={todo.id} className="bg-white border px-5 py-3 mb-2 rounded-full shadow">
              <div className="flex justify-between">
                <div className='pl-4 flex items-center'>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo)}
                    className="mr-2"
                  />
                  <p className="font-semibold">{todo.text}</p>
                  <p className="text-sm text-gray-500">Priority: {todo.priority} | Due: {todo.due_date}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(todo)} className="p-3 text-blue-700 bg-blue-100 border-2 border-blue-500 rounded-full cursor-pointer"><Pencil /></button>
                  <button onClick={() => deleteTodo(todo.id)} className="p-3 text-red-500 bg-red-100 border-2 border-red-500 rounded-full cursor-pointer"><Trash /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={summarize}
          className="bg-orange-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Summarize & Send to Slack
        </button>

        {summary && (
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mt-4 rounded-md">
            <p className="font-semibold">Summary:</p>
            <p>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;