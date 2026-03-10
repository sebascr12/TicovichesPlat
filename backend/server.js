require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const productsRouter = require('./routes/products');
const salesRouter = require('./routes/sales');
const reportsRouter = require('./routes/reports');
const authRouter = require('./routes/auth');
const inventoryRouter = require('./routes/inventory');
const expensesRouter = require('./routes/expenses');

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/expenses', expensesRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Ticoviches POS API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
