const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initMySQL } = require('./config/db');
const { login } = require('./controllers/userController');

const userRoutes        = require('./routes/userRoutes');
const productRoutes     = require('./routes/productRoutes');
const categoryRoutes    = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes      = require('./routes/reportRoutes'); 

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/login', login);
app.use('/users',        userRoutes);
app.use('/products',     productRoutes);
app.use('/categories',   categoryRoutes);
app.use('/transactions', transactionRoutes);
app.use('/reports',      reportRoutes);

// Health check
app.get('/', (req, res) => res.send('MY STOCK Backend is running'));

app.listen(PORT, async () => {
    await initMySQL();
    console.log(`Server running on http://localhost:${PORT}`);
});