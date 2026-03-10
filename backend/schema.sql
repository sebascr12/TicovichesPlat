-- Creación de la base de datos (Ejecutar manualmente en PgAdmin/psql si es necesario)
-- CREATE DATABASE ticoviches_pos;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'vendedor', -- 'admin' o 'vendedor'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos Principales
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) DEFAULT 'principal', -- 'principal' o 'extra'
    stock INTEGER DEFAULT 0, -- Inventario disponible
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Ventas (Encabezado)
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'Efectivo', 'Tarjeta', 'SINPE'
    status VARCHAR(20) DEFAULT 'active', -- 'active' o 'closed'
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalles de Ventas (Items)
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id), -- Puede ser NULL si es un 'Monto Custom' general, pero mejor tratar 'Custom' como un producto especial
    product_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Tabla de Gastos (Caja Chica)
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active' (hoy) o 'closed' (histórico)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar productos iniciales según indicaciones
INSERT INTO products (name, price) VALUES
('Caldosa', 1500.00),
('Ceviche Pequeño', 2500.00),
('Ceviche Mediano', 4000.00),
('Ceviche Grande', 7000.00);

-- Insertar un registro Dummy para representar el "Monto Custom / Extras"
INSERT INTO products (name, price, type) VALUES
('Monto Custom / Extra', 0.00, 'custom');
