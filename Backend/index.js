const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 8000;
let conn = null;
const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root',
        database: 'inventory_db', port: 8700
    });
    console.log('Connected to MySQL database');
};
const validateUser = (u) => {
    let e = [];
    return e;
};
app.get('/users', async (req, res) => {
    try {
        const [rows] = await conn.query('SELECT id, FirstName, LastName, email FROM users');
        res.json(rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post('/users', async (req, res) => {
    try {
        const errors = validateUser(req.body);
        if (errors.length > 0) return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน', errors });
        const { FirstName, LastName, email, password } = req.body;
        const [result] = await conn.query(
            'INSERT INTO users (FirstName, LastName, email, password) VALUES (?, ?, ?, ?)',
            [FirstName, LastName, email, password]
        );
        res.json({ message: 'เพิ่ม user สำเร็จ', id: result.insertId });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.get('/users/:id', async (req, res) => {
    try {
        const [rows] = await conn.query('SELECT id, FirstName, LastName, email FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบ user' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.put('/users/:id', async (req, res) => {
    try {
        const { FirstName, LastName, email, password } = req.body;
        await conn.query('UPDATE users SET FirstName=?, LastName=?, email=?, password=? WHERE id=?',
            [FirstName, LastName, email, password, req.params.id]);
        res.json({ message: 'แก้ไข user สำเร็จ' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.delete('/users/:id', async (req, res) => {
    try {
        await conn.query('DELETE FROM users WHERE id=?', [req.params.id]);
        res.json({ message: 'ลบ user สำเร็จ' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await conn.query(
            'SELECT id, FirstName, LastName, email FROM users WHERE email = ? AND password = ?',
            [email, password]);
        if (rows.length === 0) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        res.json({ message: 'Login success', user: rows[0], token: 'login-success' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.get('/', (req, res) => res.send('Backend server is running'));
app.listen(port, async () => { await initMySQL(); console.log('Server is running on http://localhost:' + port); });
