const { getConn } = require('../config/db');

// GET /categories
const getAllCategories = async (req, res) => {
    try {
        const [rows] = await getConn().query('SELECT id, name FROM categories');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูล category ไม่สำเร็จ', error: error.message });
    }
};

// GET /categories/:id
const getCategoryById = async (req, res) => {
    try {
        const [rows] = await getConn().query(
            'SELECT id, name FROM categories WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบ category' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูล category ไม่สำเร็จ', error: error.message });
    }
};

// POST /categories
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const [rows] = await getConn().query(
            'INSERT INTO categories (name) VALUES (?)',
            [name]
        );
        res.json({ message: 'เพิ่ม category สำเร็จ', data: rows });
    } catch (error) {
        res.status(500).json({ message: 'เพิ่ม category ไม่สำเร็จ', error: error.message });
    }
};

// PUT /categories/:id
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        await getConn().query(
            'UPDATE categories SET name=? WHERE id=?',
            [name, req.params.id]
        );
        res.json({ message: 'แก้ไข category สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'แก้ไข category ไม่สำเร็จ', error: error.message });
    }
};

// DELETE /categories/:id
const deleteCategory = async (req, res) => {
    try {
        await getConn().query('DELETE FROM categories WHERE id=?', [req.params.id]);
        res.json({ message: 'ลบ category สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'ลบ category ไม่สำเร็จ', error: error.message });
    }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };