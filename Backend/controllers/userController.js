const { getConn } = require('../config/db');

const validateUser = (userData) => {
    let errors = [];
    if (!userData.FirstName) errors.push('กรุณากรอกชื่อ');
    if (!userData.LastName)  errors.push('กรุณากรอกนามสกุล');
    if (!userData.email)     errors.push('กรุณากรอก email');
    if (!userData.password)  errors.push('กรุณากรอกรหัสผ่าน');
    return errors;
};

// GET /users
const getAllUsers = async (req, res) => {
    try {
        const [rows] = await getConn().query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูล users ไม่สำเร็จ', error: error.message });
    }
};

// GET /users/:id
const getUserById = async (req, res) => {
    try {
        const [rows] = await getConn().query(
            'SELECT id, FirstName, LastName, email FROM users WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบ user' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูล user ไม่สำเร็จ', error: error.message });
    }
};

// POST /users
const createUser = async (req, res) => {
    try {
        const user = req.body;
        const errors = validateUser(user);
        if (errors.length > 0) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ', errors });
        }
        const [rows] = await getConn().query(
            'INSERT INTO users (FirstName, LastName, email, password) VALUES (?, ?, ?, ?)',
            [user.FirstName, user.LastName, user.email, user.password]
        );
        res.json({ message: 'เพิ่ม user สำเร็จ', data: rows });
    } catch (error) {
        res.status(500).json({ message: 'เพิ่ม user ไม่สำเร็จ', error: error.message });
    }
};

// PUT /users/:id
const updateUser = async (req, res) => {
    try {
        const { FirstName, LastName, email, password } = req.body;
        await getConn().query(
            'UPDATE users SET FirstName=?, LastName=?, email=?, password=? WHERE id=?',
            [FirstName, LastName, email, password, req.params.id]
        );
        res.json({ message: 'แก้ไข user สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'แก้ไข user ไม่สำเร็จ', error: error.message });
    }
};

// DELETE /users/:id
const deleteUser = async (req, res) => {
    try {
        await getConn().query('DELETE FROM users WHERE id=?', [req.params.id]);
        res.json({ message: 'ลบ user สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'ลบ user ไม่สำเร็จ', error: error.message });
    }
};

// POST /login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'กรุณากรอก email และ password' });
        }
        const [rows] = await getConn().query(
            'SELECT id, FirstName, LastName, email FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length === 0) {
            return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }
        res.json({ message: 'Login success', user: rows[0], token: 'login-success' });
    } catch (error) {
        res.status(500).json({ message: 'เข้าสู่ระบบไม่สำเร็จ', error: error.message });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, login };