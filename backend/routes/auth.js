const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar JWT Token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'ticoviches_secret_key_2026',
            { expiresIn: '12h' } // 12 horas de duración
        );

        res.json({
            message: 'Autenticación exitosa',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// POST /api/auth/setup-initial - Útil solo al inicio para crear cuentas
router.post('/setup-initial', async (req, res) => {
    try {
        // Revisa si ya existen usuarios
        const check = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(check.rows[0].count) > 0) {
            return res.status(400).json({ message: 'Los usuarios ya han sido inicializados.' });
        }

        const adminPass = await bcrypt.hash('admin123', 10);
        const vendorPass = await bcrypt.hash('ventas123', 10);

        await pool.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
            ['admin', adminPass, 'admin']
        );

        await pool.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
            ['caja', vendorPass, 'vendedor']
        );

        res.json({ message: 'Usuarios por defecto creados. (admin/admin123 y caja/ventas123)' });
    } catch (error) {
        console.error('Error setup:', error);
        res.status(500).json({ message: 'Error creando usuarios', error: error.message });
    }
})

module.exports = router;
