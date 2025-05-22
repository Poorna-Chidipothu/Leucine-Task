import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil, Trash } from 'lucide-react';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [editId, setEditId] = useState(null);

  const fetchTodos = async () => {
    try {
      const res = await axios.get('/api/todos');
      setTodos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const addTodo = async () => {
    if (!text) {
      toast.error("Task description is required.");
      return;
    }
    try {
      if (editId) {
        await axios.put(`/api/todos/${editId}`, { text });
        toast.success("Todo updated successfully!");
      } else {
        await axios.post('/api/todos', { text });
        toast.success("Todo added successfully!");
      }
      setText('');
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
      <div className=" lg:w-[50%] md:w-[75%] sm:w-[90%] bg-white p-6 shadow-2xl flex flex-col rounded-xl mt-20">
        <h1 className="text-3xl font-extrabold text-orange-600 mb-4 text-center">Todo Summary Assistant</h1>

        <div className="border-2 border-orange-600 bg-white rounded-xl shadow mb-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Task description"
              value={text}
              onChange={e => setText(e.target.value)}
              className=" px-4 py-4 pr-50 rounded w-full focus:outline-none focus:border-orange-400"
            />
            <button
              onClick={addTodo}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-2 rounded shadow-md transition cursor-pointer"
            >
              {editId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>


        <ul className="mb-4">
          {todos.map(todo => (
            <li key={todo.id} className="w-full bg-white border px-5 py-3 mb-3 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div className='flex flex-col md:flex-row md:items-center gap-1'>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo)}
                      className="custom-checkbox"
                    />
                    <p className={`font-semibold ${todo.completed ? 'line-through text-gray-400' : ''}`}>{todo.text}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   {!todo.completed && (
                  <button
                    onClick={() => startEdit(todo)}
                    className="p-2 text-blue-700 bg-blue-100 border border-blue-500 rounded-full hover:bg-blue-200 cursor-pointer"
                  >
                    <Pencil size={16} />
                  </button>
                  )}
                  {todo.completed && (
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-2 text-red-500 bg-red-100 border border-red-500 rounded-full hover:bg-red-200 cursor-pointer"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={summarize}
          className="bg-orange-500 hover:bg-orange-600 text-white text-2xl px-4 py-3 rounded-xl w-full text-center cursor-pointer"
        >
          Summarize & Send to Slack
        </button>

        {summary && (
          <div className="bg-orange-100 border-l-4 border-orange-500  p-4 mt-4 rounded-md">
            <p className="font-semibold text-2xl text-orange-700">Summary:</p>
            <p className='text-xl text-gray-950'>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
