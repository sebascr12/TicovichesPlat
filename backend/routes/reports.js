const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');

// Reporte diario para el dashboard
router.get('/daily', async (req, res) => {
    try {
        // Total recaudado hoy, ventas hoy, etc.
        const todayQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) AS total_amount,
        COUNT(id) AS transactions
      FROM sales
      WHERE DATE(sale_date) = CURRENT_DATE
    `;
        const todayResult = await db.query(todayQuery);

        // Ventas por método de pago de hoy
        const methodsQuery = `
      SELECT 
        payment_method, 
        COUNT(id) AS count, 
        COALESCE(SUM(total_amount), 0) AS total_amount
      FROM sales
      WHERE DATE(sale_date) = CURRENT_DATE
      GROUP BY payment_method
    `;
        const methodsResult = await db.query(methodsQuery);

        // Productos más vendidos hoy
        const topProductsQuery = `
      SELECT 
        product_name, 
        SUM(quantity) AS total_quantity, 
        COALESCE(SUM(subtotal), 0) AS total_revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE DATE(s.sale_date) = CURRENT_DATE
      GROUP BY product_name
      ORDER BY total_quantity DESC
      LIMIT 5
    `;
        const topProductsResult = await db.query(topProductsQuery);

        res.json({
            summary: {
                total_amount: parseFloat(todayResult.rows[0].total_amount),
                transactions: parseInt(todayResult.rows[0].transactions),
            },
            by_payment_method: methodsResult.rows,
            top_products: topProductsResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Exportar a Excel
router.get('/excel', async (req, res) => {
    try {
        const query = `
      SELECT 
        s.id AS sale_id,
        s.sale_date,
        s.payment_method,
        si.product_name,
        si.quantity,
        si.unit_price,
        si.subtotal
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      WHERE DATE(s.sale_date) = CURRENT_DATE
      ORDER BY s.sale_date DESC
    `;
        const result = await db.query(query);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ventas de Hoy');

        worksheet.columns = [
            { header: 'ID Venta', key: 'sale_id', width: 10 },
            { header: 'Fecha y Hora', key: 'sale_date', width: 25 },
            { header: 'Método de Pago', key: 'payment_method', width: 20 },
            { header: 'Producto', key: 'product_name', width: 30 },
            { header: 'Cantidad', key: 'quantity', width: 10 },
            { header: 'Precio Unitario', key: 'unit_price', width: 15 },
            { header: 'Subtotal', key: 'subtotal', width: 15 },
        ];

        result.rows.forEach(row => {
            worksheet.addRow(row);
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'ventas_ticoviches_hoy.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al generar Excel' });
    }
});

module.exports = router;
