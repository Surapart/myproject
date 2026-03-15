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
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'inventory_db',
        port: 8700
    });
    console.log('Connected to MySQL database');
};

const validateUser = (userData) => {
    let errors = [];

    if (!userData.FirstName) {
        errors.push('กรุณากรอกชื่อ');
    }
    if (!userData.LastName) {
        errors.push('กรุณากรอกนามสกุล');
    }
    if (!userData.email) {
        errors.push('กรุณากรอก email');
    }
    if (!userData.password) {
        errors.push('กรุณากรอกรหัสผ่าน');
    }
    return errors;
};

//------------users API------------//

// GET users
app.get('/users', async (req, res) => {
    try {
        const [rows] = await conn.query(
            'SELECT id, FirstName, LastName, email FROM users'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            message: 'ดึงข้อมูล users ไม่สำเร็จ',
            error: error.message
        });
    }
});

// POST user
app.post('/users', async (req, res) => {
    try {
        const user = req.body;
        const errors = validateUser(user); // แก้ตรงนี้
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบ',
                errors: errors
            });
        }
        const [rows] = await conn.query(
            'INSERT INTO users (FirstName, LastName, email, password) VALUES (?, ?, ?, ?)',
            [user.FirstName, user.LastName, user.email, user.password]
        );
        res.json({
            message: 'เพิ่ม user สำเร็จ',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            message: 'เพิ่ม user ไม่สำเร็จ',
            error: error.message
        });
    }
});

// GET user by id
app.get('/users/:id', async (req, res) => {
    try {
        const [rows] = await conn.query(
            'SELECT id, FirstName, LastName, email FROM users WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบ user' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'ดึงข้อมูล user ไม่สำเร็จ',
            error: error.message
        });
    }
});

// PUT user by id
app.put('/users/:id', async (req, res) => {
    try {
        const { FirstName, LastName, email, password } = req.body;
        await conn.query(
            'UPDATE users SET FirstName=?, LastName=?, email=?, password=? WHERE id=?',
            [FirstName, LastName, email, password, req.params.id]
        );
        res.json({ message: 'แก้ไข user สำเร็จ' });
    } catch (error) {
        res.status(500).json({
            message: 'แก้ไข user ไม่สำเร็จ',
            error: err.message
        });
    }
});

// DELETE user by id
app.delete('/users/:id', async (req, res) => {
    try {
        await conn.query(
            'DELETE FROM users WHERE id=?',
            [req.params.id]
        );
        res.json({ message: 'ลบ user สำเร็จ' });
    } catch (error) {
        res.status(500).json({
            message: 'ลบ user ไม่สำเร็จ',
            error: error.message
        });
    }
});

// POST login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'กรุณากรอก email และ password'
            });
        }
        const [rows] = await conn.query(
            'SELECT id, FirstName, LastName, email FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length === 0) {
            return res.status(401).json({
                message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            });
        }
        res.json({
            message: 'Login success',
            user: rows[0],
            token: 'login-success'
        });
    } catch (error) {
        res.status(500).json({
            message: 'เข้าสู่ระบบไม่สำเร็จ',
            error: error.message
        });
    }
});

//------------products API------------//

//GET products
app.get('/products', async (req, res) => {
    try {
        const [rows] = await conn.query(
            'SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            message: 'ดึงข้อมูล products ไม่สำเร็จ',
            error: error.message
        });
    }
});

//POST products
app.post('/products', async (req, res) => {
    const { name, category_id, sku, min_stock, current_stock } = req.body;
    try {

        const [rows] = await conn.query(
            'INSERT INTO products (name, category_id, sku, min_stock, current_stock) VALUES (?, ?, ?, ?, ?)',
            [name, category_id, sku, min_stock, current_stock]
        );
        res.json({
            message: 'เพิ่ม product สำเร็จ',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            message: 'เพิ่ม product ไม่สำเร็จ',
            error: error.message
        });
    }
});

//GET products by id
app.get('/products/:id', async (req, res) => {
    try {
        const [rows] = await conn.query(
            'SELECT id, name, category_id, sku, min_stock, current_stock FROM products WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(500).json({ message: 'ไม่พบ product ' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(404).json({
            message: 'ดึงข้อมูล product ไม่สำเร็จ',
            error: error.message
        });
    }
});

//PUT products by id
app.put('/products/:id', async (req, res) => {
    try {
        const { name, category_id, sku, min_stock, current_stock } = req.body;
        await conn.query(
            'UPDATE products SET name=?, category_id=?, sku=?, min_stock=?, current_stock=? WHERE id=?',
            [name, category_id, sku, min_stock, current_stock, req.params.id]
        );
        res.json({ message: 'เเก้ไข product สำเร็จ' })
    } catch (error) {
        res.status(500).json({
            message: 'เเก้ไข product ไม่สำเร็จ',
            error: error.message
        });
    }
});

//DELETE products by id
app.delete('/products/:id', async (req, res) => {
    try {
        await conn.query(
            'DELETE FROM products WHERE id=?',
            [req.params.id]
        );
        req.json({ message: 'ลบ product สำเร็จ' });
    } catch (error) {
        res.status(500).json({
            message: 'ลบ product ไม่สำเร็จ',
            error: error.message
        });
    }
});

//---------------TEST SERVER---------------//
app.get('/', (req, res) => {
    res.send('Backend server is running');
});

app.listen(port, async () => {
    await initMySQL();
    console.log('Server is running on http://localhost:' + port);
});
