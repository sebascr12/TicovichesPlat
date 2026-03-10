const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener gastos activos (del turno actual)
router.get('/', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM expenses WHERE status = 'active' ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Registrar un nuevo gasto
router.post('/', async (req, res) => {
    const { amount, description } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO expenses (amount, description, status) VALUES ($1, $2, 'active') RETURNING *",
            [amount, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error registrando gasto' });
    }
});

// Eliminar un gasto (por si se equivocaron al ingresarlo)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM expenses WHERE id = $1", [id]);
        res.json({ message: 'Gasto eliminado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error eliminando gasto' });
    }
});

module.exports = router;
