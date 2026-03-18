const { getConn } = require('../config/db');

// GET /reports/daily?date=YYYY-MM-DD
const getDailyReport = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().slice(0, 10);
        const conn = getConn();

        const [summary] = await conn.query(`
            SELECT 
                DATE(created_at) as date,
                type,
                SUM(quantity) as total_quantity,
                COUNT(id) as total_transactions
            FROM stock_transactions
            WHERE DATE(created_at) = ?
            GROUP BY DATE(created_at), type
        `, [date]);

        const [byProduct] = await conn.query(`
            SELECT 
                t.type,
                t.quantity,
                t.created_at,
                p.name as product_name,
                p.sku
            FROM stock_transactions t
            LEFT JOIN products p ON t.product_id = p.id
            WHERE DATE(t.created_at) = ?
            ORDER BY t.created_at DESC
        `, [date]);

        res.json({ date, summary, byProduct });
    } catch (error) {
        res.status(500).json({ message: 'ดึงรายงานรายวันไม่สำเร็จ', error: error.message });
    }
};

// GET /reports/monthly?month=MM&year=YYYY
const getMonthlyReport = async (req, res) => {
    try {
        const now = new Date();
        const month = req.query.month || (now.getMonth() + 1);
        const year  = req.query.year  || now.getFullYear();
        const conn  = getConn();

        const [summary] = await conn.query(`
            SELECT 
                MONTH(created_at) as month,
                YEAR(created_at) as year,
                type,
                SUM(quantity) as total_quantity,
                COUNT(id) as total_transactions
            FROM stock_transactions
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
            GROUP BY YEAR(created_at), MONTH(created_at), type
        `, [month, year]);

        const [byProduct] = await conn.query(`
            SELECT 
                p.name as product_name,
                p.sku,
                SUM(CASE WHEN t.type = 'IN'  THEN t.quantity ELSE 0 END) as total_in,
                SUM(CASE WHEN t.type = 'OUT' THEN t.quantity ELSE 0 END) as total_out,
                COUNT(t.id) as total_transactions
            FROM stock_transactions t
            LEFT JOIN products p ON t.product_id = p.id
            WHERE MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?
            GROUP BY t.product_id, p.name, p.sku
            ORDER BY total_transactions DESC
        `, [month, year]);

        res.json({ month, year, summary, byProduct });
    } catch (error) {
        res.status(500).json({ message: 'ดึงรายงานรายเดือนไม่สำเร็จ', error: error.message });
    }
};

// GET /reports/yearly?year=YYYY
const getYearlyReport = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        const conn = getConn();

        const [summary] = await conn.query(`
            SELECT 
                MONTH(created_at) as month,
                type,
                SUM(quantity) as total_quantity,
                COUNT(id) as total_transactions
            FROM stock_transactions
            WHERE YEAR(created_at) = ?
            GROUP BY MONTH(created_at), type
            ORDER BY month ASC
        `, [year]);

        const [byProduct] = await conn.query(`
            SELECT 
                p.name as product_name,
                p.sku,
                SUM(CASE WHEN t.type = 'IN'  THEN t.quantity ELSE 0 END) as total_in,
                SUM(CASE WHEN t.type = 'OUT' THEN t.quantity ELSE 0 END) as total_out,
                COUNT(t.id) as total_transactions
            FROM stock_transactions t
            LEFT JOIN products p ON t.product_id = p.id
            WHERE YEAR(t.created_at) = ?
            GROUP BY t.product_id, p.name, p.sku
            ORDER BY total_transactions DESC
        `, [year]);

        res.json({ year, summary, byProduct });
    } catch (error) {
        res.status(500).json({ message: 'ดึงรายงานรายปีไม่สำเร็จ', error: error.message });
    }
};

module.exports = { getDailyReport, getMonthlyReport, getYearlyReport };