// 1. ตรวจสอบ Login และแสดงชื่อ
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    window.location.href = "index.html";
} else {
    // ใช้เครื่องหมาย ?. เพื่อป้องกัน error ถ้าหา id="username" ไม่เจอ
    const nameDisplay = document.getElementById("username");
    if (nameDisplay) {
        nameDisplay.innerText = `${user.FirstName} ${user.LastName}`;
    }
}

// 2. โหลดข้อมูล Dashboard
async function loadDashboard() {
    try {
        console.log("กำลังดึงข้อมูลจาก API...");
        const [userRes, productRes, lowRes] = await Promise.all([
            fetch("http://localhost:8000/users"),
            fetch("http://localhost:8000/products"),
            fetch("http://localhost:8000/products/lowstock")
        ]);

        const users = await userRes.json();
        const products = await productRes.json();
        const lowProducts = await lowRes.json();

        // --- อัปเดตตัวเลขในการ์ด (เช็คให้ชัวร์ว่ามีช่องให้ใส่เลข) ---
        const totalUsersEl = document.getElementById("totalUsers");
        const totalProductsEl = document.getElementById("totalProducts");
        const lowStockEl = document.getElementById("lowStock");

        if (totalUsersEl) totalUsersEl.innerText = users.length.toLocaleString();
        if (totalProductsEl) totalProductsEl.innerText = products.length.toLocaleString();
        if (lowStockEl) lowStockEl.innerText = lowProducts.length.toLocaleString();

        // --- อัปเดตตารางสรุปล่าสุด ---
        const tableBody = document.getElementById("productTable");
        if (tableBody) {
            const recentProducts = products.slice(0, 5); 
            tableBody.innerHTML = recentProducts.map(p => {
                // เช็คตัวแปรเผื่อชื่อใน DB ไม่เหมือนกัน
                const currentStock = p.current_stock ?? p.Stock ?? 0;
                const minStock = p.min_stock ?? p.MinStock ?? 5;
                const name = p.name ?? p.ProductName ?? 'ไม่มีชื่อ';

                return `
                    <tr>
                        <td>#${p.id}</td>
                        <td style="font-weight: 500;">${name}</td>
                        <td>${p.category || 'ทั่วไป'}</td>
                        <td>
                            <span class="stock-badge ${currentStock <= minStock ? 'stock-low' : 'stock-ok'}">
                                ${currentStock.toLocaleString()}
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');
        }

    } catch (err) {
        console.error("โหลดข้อมูล Dashboard ไม่สำเร็จ:", err);
    }
}

// 3. Logout
function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

// รันเมื่อโหลดหน้าเสร็จสมบูรณ์
document.addEventListener("DOMContentLoaded", loadDashboard);