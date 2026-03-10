const express = require('express');
const router = express.Router();
const db = require('../db');

// Registrar una nueva venta
router.post('/', async (req, res) => {
    const { total_amount, payment_method, items } = req.body;

    if (!total_amount || !payment_method || !items || items.length === 0) {
        return res.status(400).json({ error: 'Faltan datos requeridos (total, método de pago o items)' });
    }

    try {
        // Iniciar transacción
        await db.query('BEGIN');

        // Insertar encabezado de venta
        const saleResult = await db.query(
            'INSERT INTO sales (total_amount, payment_method) VALUES ($1, $2) RETURNING id',
            [total_amount, payment_method]
        );
        const saleId = saleResult.rows[0].id;

        // Insertar items de la venta
        for (const item of items) {
            await db.query(
                'INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6)',
                [saleId, item.product_id || null, item.name, item.quantity, item.price, item.subtotal]
            );
        }

        // Confirmar transacción
        await db.query('COMMIT');

        res.status(201).json({ message: 'Venta registrada con éxito', saleId });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al registrar la venta' });
    }
});

// Obtener ventas (opcional, para historial)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sales ORDER BY sale_date DESC LIMIT 100');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
