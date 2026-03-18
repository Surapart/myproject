// 1. ตรวจสอบ Login และแสดงชื่อ
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    window.location.href = "index.html";
} else {
    const nameDisplay = document.getElementById("username");
    if (nameDisplay) {
        nameDisplay.innerText = `${user.FirstName} ${user.LastName}`;
    }
    // Set avatar initials
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.textContent = (user.FirstName?.[0] || '') + (user.LastName?.[0] || '');
    const udName = document.getElementById('udName');
    if (udName) udName.textContent = user.FirstName + ' ' + user.LastName;
    const udEmail = document.getElementById('udEmail');
    if (udEmail) udEmail.textContent = user.email || '';
}

// 2. โหลดข้อมูล Dashboard
async function loadDashboard() {
    try {
        console.log("กำลังดึงข้อมูลจาก API...");
        const [userRes, productRes] = await Promise.all([
            fetch("http://localhost:8000/users"),
            fetch("http://localhost:8000/products")
        ]);

        const users = await userRes.json();
        const products = await productRes.json();

        // คำนวณสินค้าใกล้หมดจาก array (ไม่มี endpoint /products/lowstock ใน backend)
        const lowProducts = products.filter(p =>
            Number(p.current_stock ?? 0) <= Number(p.min_stock ?? 0)
        );

        const totalUsersEl    = document.getElementById("totalUsers");
        const totalProductsEl = document.getElementById("totalProducts");
        const lowStockEl      = document.getElementById("lowStock");

        if (totalUsersEl)    totalUsersEl.innerText    = users.length.toLocaleString();
        if (totalProductsEl) totalProductsEl.innerText = products.length.toLocaleString();
        if (lowStockEl)      lowStockEl.innerText      = lowProducts.length.toLocaleString();

        const tableBody = document.getElementById("productTable");
        if (tableBody) {
            const recentProducts = products.slice(0, 5); 
            tableBody.innerHTML = recentProducts.map(p => {
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

document.addEventListener("DOMContentLoaded", loadDashboard);
function toggleUserMenu() {
    const dd = document.getElementById("userDropdown");
    const chev = document.getElementById("userChev");
    dd.classList.toggle("open");
    chev.textContent = dd.classList.contains("open") ? "▲" : "▼";
}

document.addEventListener("click", function(e) {
    const pill = document.getElementById("userPill");
    if (pill && !pill.contains(e.target)) {
        document.getElementById("userDropdown").classList.remove("open");
        document.getElementById("userChev").textContent = "▼";
    }
});