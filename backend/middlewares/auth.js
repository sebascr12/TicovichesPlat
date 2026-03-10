const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Obtenemos el token desde el header de Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No se propocionó token de autenticación. Acceso denegado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ticoviches_secret_key_2026');
        req.user = decoded; // Guardamos { id, username, role } en la request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado. Inicia sesión nuevamente.', error: error.message });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso Denegado. Solo administradores pueden realizar esta acción.' });
    }
};

module.exports = { authMiddleware, adminMiddleware };
