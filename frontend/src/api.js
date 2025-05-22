import axios from 'axios';

const baseURL = import.meta.env.PROD
  ? 'https://leucine-task.onrender.com/api'  // 🔁 Replace with your actual Render backend URL
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

export default api;