const { getConn } = require('../config/db');

// GET /transactions
const getAllTransactions = async (req, res) => {
    try {
        const [rows] = await getConn().query('SELECT * FROM stock_transactions');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูล transactions ไม่สำเร็จ', error: error.message });
    }
};

// GET /transactions/:id
const getTransactionById = async (req, res) => {
    try {
        const [rows] = await getConn().query(
            'SELECT id, product_id, type, quantity FROM stock_transactions WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบ transaction' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูล transaction ไม่สำเร็จ', error: error.message });
    }
};

// POST /transactions
const createTransaction = async (req, res) => {
    try {
        const { product_id, type, quantity } = req.body;

        if (!product_id || !type || !quantity) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
        }
        if (!['IN', 'OUT'].includes(type)) {
            return res.status(400).json({ message: 'type ต้องเป็น IN หรือ OUT เท่านั้น' });
        }

        const [product] = await getConn().query(
            'SELECT current_stock, min_stock, name FROM products WHERE id=?',
            [product_id]
        );
        if (product.length === 0) {
            return res.status(404).json({ message: 'ไม่พบ product' });
        }

        const newStock = type === 'IN'
            ? product[0].current_stock + quantity
            : product[0].current_stock - quantity;

        if (newStock < 0) {
            return res.status(400).json({ message: 'stock ไม่พอ' });
        }

        const [rows] = await getConn().query(
            'INSERT INTO stock_transactions (product_id, type, quantity) VALUES (?, ?, ?)',
            [product_id, type, quantity]
        );
        await getConn().query(
            'UPDATE products SET current_stock=? WHERE id=?',
            [newStock, product_id]
        );

        const isLowStock = newStock <= product[0].min_stock;
        res.json({
            message: `${type} stock สำเร็จ`,
            data: rows,
            new_stock: newStock,
            low_stock_warning: isLowStock
                ? `${product[0].name} เหลือ ${newStock} ชิ้น ต่ำกว่าขั้นต่ำ (${product[0].min_stock})`
                : null
        });
    } catch (error) {
        res.status(500).json({ message: 'เพิ่ม transaction ไม่สำเร็จ', error: error.message });
    }
};

module.exports = { getAllTransactions, getTransactionById, createTransaction };