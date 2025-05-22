const express = require('express');
const cors = require('cors');
require('dotenv').config();
const todoRoutes = require('./routes/todos');
const summarizeRoute = require('./routes/summarize');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/todos', todoRoutes);
app.use('/api/summarize', summarizeRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));