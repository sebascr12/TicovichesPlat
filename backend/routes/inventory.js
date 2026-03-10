const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Aplica el middleware de autenticación a todas estas rutas de inventario
router.use(authMiddleware);

// GET /api/inventory/sales -> Obtener historial completo de ventas (Solo visible para users logeados)
router.get('/sales', async (req, res) => {
    try {
        const query = `
            SELECT s.id, s.total_amount, s.payment_method, s.sale_date,
            json_agg(json_build_object(
                'product_name', si.product_name,
                'quantity', si.quantity,
                'unit_price', si.unit_price,
                'subtotal', si.subtotal
            )) as items
            FROM sales s
            LEFT JOIN sale_items si ON s.id = si.sale_id
            GROUP BY s.id
            ORDER BY s.sale_date DESC
            LIMIT 100; -- Limitar a las últimas 100 para no saturar.
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching inventory sales:', error);
        res.status(500).json({ message: 'Error retrieving structured sales history', error: error.message });
    }
});

// A PARTIR DE ACÁ REQUIEREN SER ADMIN
router.use(adminMiddleware);

// POST /api/inventory/products -> Agregar producto nuevo
router.post('/products', async (req, res) => {
    const { name, price, type, stock } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (name, price, type, stock) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, price, type || 'principal', stock || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error agregando producto', error: error.message });
    }
});

// PUT /api/inventory/products/:id -> Editar producto
router.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, type, stock, is_active } = req.body;
    try {
        const result = await pool.query(
            'UPDATE products SET name = COALESCE($1, name), price = COALESCE($2, price), type = COALESCE($3, type), stock = COALESCE($4, stock), is_active = COALESCE($5, is_active) WHERE id = $6 RETURNING *',
            [name, price, type, stock, is_active, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando producto', error: error.message });
    }
});

module.exports = router;
