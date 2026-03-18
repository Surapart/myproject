const { getConn } = require('../config/db');

// GET /products
const getAllProducts = async (req, res) => {
    try {
        const [rows] = await getConn().query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูล products ไม่สำเร็จ', error: error.message });
    }
};

// GET /products/:id
const getProductById = async (req, res) => {
    try {
        const [rows] = await getConn().query(
            'SELECT id, name, category_id, sku, min_stock, current_stock FROM products WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบ product' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูล product ไม่สำเร็จ', error: error.message });
    }
};

// POST /products
const createProduct = async (req, res) => {
    try {
        const { name, category_id, sku, min_stock, current_stock } = req.body;
        const [rows] = await getConn().query(
            'INSERT INTO products (name, category_id, sku, min_stock, current_stock) VALUES (?, ?, ?, ?, ?)',
            [name, category_id, sku, min_stock, current_stock]
        );
        res.json({ message: 'เพิ่ม product สำเร็จ', data: rows });
    } catch (error) {
        res.status(500).json({ message: 'เพิ่ม product ไม่สำเร็จ', error: error.message });
    }
};

// PUT /products/:id
const updateProduct = async (req, res) => {
    try {
        const { name, category_id, sku, min_stock, current_stock } = req.body;
        await getConn().query(
            'UPDATE products SET name=?, category_id=?, sku=?, min_stock=?, current_stock=? WHERE id=?',
            [name, category_id, sku, min_stock, current_stock, req.params.id]
        );
        res.json({ message: 'แก้ไข product สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'แก้ไข product ไม่สำเร็จ', error: error.message });
    }
};

// DELETE /products/:id
const deleteProduct = async (req, res) => {
    try {
        await getConn().query('DELETE FROM products WHERE id=?', [req.params.id]);
        res.json({ message: 'ลบ product สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'ลบ product ไม่สำเร็จ', error: error.message });
    }
};

// GET /products/low-stock
const getLowStockProducts = async (req, res) => {
    try {
        const [rows] = await getConn().query(
            'SELECT id, name, current_stock FROM products WHERE current_stock <= min_stock'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูลสินค้าใกล้หมดไม่สำเร็จ', error: error.message });
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getLowStockProducts };