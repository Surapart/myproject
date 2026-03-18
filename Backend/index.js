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

//------------users------------//

// GET users
app.get('/users', async (req, res) => {
    try {
        const [rows] = await conn.query(
            'SELECT * FROM users'
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

//------------users by id------------//

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
            error: error.message
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

//------------products------------//

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
            return res.status(404).json({ message: 'ไม่พบ product ' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
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
        res.json({ message: 'ลบ product สำเร็จ' });
    } catch (error) {
        res.status(500).json({
            message: 'ลบ product ไม่สำเร็จ',
            error: error.message
        });
    }
});

//------------categories------------//

//GET categories
app.get('/categories', async (req, res) => {
    try {
        const [rows] = await conn.query(
             'SELECT id, name FROM categories'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            message: 'ดึงข้อมูล category ไม่สำเร็จ',
            error: error.message
        });
    }
});

//POST categories
app.post('/categories', async (req, res) => {
    const { name } = req.body;
    try {
        const [rows] = await conn.query(
            'INSERT INTO categories (name) VALUES (?)',
            [name]
        );
        res.json({
            message: 'เพิ่ม category สำเร็จ',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            message: 'เพิ่ม category ไม่สำเร็จ',
            error: error.message
        });
    }
})

//GET categories by id
app.get('/categories/:id', async (req, res) => {
    try {
        const [rows] = await conn.query(
            'SELECT id, name FROM categories WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบ categories' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'ดึงข้อมูล categories ไม่สำเร็จ',
            error: error.message
        });
    }
});

//PUT categories by id
app.put('/categories/:id', async (req, res) => {
    try {
        const { name } = req.body;
        await conn.query(
            'UPDATE categories SET name=? WHERE id=?',
            [name, req.params.id]
        );
        res.json({ message: 'เเก้ไข categories สำเร็จ' });
    } catch (error) {
        res.status(500).json({
            message: 'เเก้ไข categories ไม่สำเร็จ',
            error: error.message
        });
    }
});

//DELETE categories by id 
app.delete('/categories/:id', async (req, res) => {
    try {
        await conn.query(
            'DELETE FROM categories WHERE id=?',
            [req.params.id]
        );
        res.json({ message: 'ลบ categories สำเร็จ' });
    } catch (error) {
        res.status(500).json({
            message: 'ลบ categories ไม่สำเร็จ',
            error: error.message
        });
    }
});

//---------------transactions---------------//

//GET stock_transactions
app.get('/transactions', async (req, res) => {
    try {
        const [rows] = await conn.query(
            'SELECT * FROM stock_transactions'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            message: 'ดึงข้อมูล transactions ไม่สำเร็จ',
            error: error.message
        });
    }
});

//POST stock_transactions
app.post('/transactions', async (req, res) => {
    const { product_id, type, quantity } = req.body;
    try {
        if (!product_id || !type || !quantity) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
        }
        if (!['IN', 'OUT'].includes(type)) {
            return res.status(400).json({ message: 'type ต้องเป็น IN หรือ OUT เท่านั้น' });
        }
        
        const [product] = await conn.query(
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

        const [rows] = await conn.query(
            'INSERT INTO stock_transactions (product_id, type, quantity) VALUES (?, ?, ?)',
            [product_id, type, quantity]
        );
        await conn.query(
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
        res.status(500).json({
            message: 'เพิ่ม transaction ไม่สำเร็จ',
            error: error.message
        });
    }
});

//GET transactions by id
app.get('/transactions/:id', async (req, res) => {
    try {
        const [rows] = await conn.query(
           'SELECT * FROM stock_transactions WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบ transactions' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'ดึงข้อมูล transactions ไม่สำเร็จ',
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
