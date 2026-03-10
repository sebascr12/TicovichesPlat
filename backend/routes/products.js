const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los productos activos
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products WHERE is_active = true ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nuevo producto (opcional, para uso futuro del admin)
router.post('/', async (req, res) => {
    const { name, price, type } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO products (name, price, type) VALUES ($1, $2, $3) RETURNING *',
            [name, price, type || 'principal']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
