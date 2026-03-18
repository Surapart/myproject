// 1. ตรวจสอบ Login และดึงชื่อมาแสดง
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    // ถ้าไม่ได้ Login ให้เด้งไปหน้า index
    window.location.href = "index.html";
} else {
    // หาตัวที่มี id="username" แล้วเปลี่ยน Loading... เป็นชื่อจริง
    const usernameElement = document.getElementById("username");
    if (usernameElement) {
        // ต้องมั่นใจว่าใน localStorage ของหนูใช้ชื่อตัวแปร FirstName และ LastName นะลูก
        usernameElement.innerText = `${user.FirstName} ${user.LastName}`;
    // Set avatar initials
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.textContent = (user.FirstName?.[0] || '') + (user.LastName?.[0] || '');
    const udName = document.getElementById('udName');
    if (udName) udName.textContent = user.FirstName + ' ' + user.LastName;
    const udEmail = document.getElementById('udEmail');
    if (udEmail) udEmail.textContent = user.email || '';
    }
}
// 2. โหลดสินค้าเข้าตาราง
async function loadProducts() {
    try {
        const [productRes, categoryRes] = await Promise.all([
            fetch("http://localhost:8000/products"),
            fetch("http://localhost:8000/categories")
        ]);
        const products   = await productRes.json();
        const categories = await categoryRes.json();
        const catMap = {};
        if (Array.isArray(categories)) {
            categories.forEach(c => { catMap[c.id] = c.name; });
        }
        const table = document.getElementById("fullProductTable");

        if (!table) return;

        table.innerHTML = products.map(p => {
            const currentStock = p.current_stock ?? p.Stock ?? 0;
            const minStock = p.min_stock ?? p.MinStock ?? 0;
            const productName = p.name ?? p.ProductName ?? 'ไม่มีชื่อสินค้า';
            const category = catMap[p.category_id] ?? 'ทั่วไป';

            return `
                <tr>
                    <td>#${p.id}</td>
                    <td style="font-weight: 500; color: #333;">${productName}</td>
                    <td>${p.sku || p.SKU || '-'}</td>
                    <td>${category}</td>
                    <td>
                        <span class="stock-badge ${currentStock <= minStock ? 'stock-low' : 'stock-ok'}">
                            ${Number(currentStock).toLocaleString()} ชิ้น
                        </span>
                    </td>
                    <td>${Number(minStock).toLocaleString()}</td>
                    <td style="text-align: center;">
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editProduct(${p.id})">แก้ไข</button>
                            <button class="btn-delete" onclick="deleteProduct(${p.id})">ลบ</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error("โหลดสินค้าไม่ได้จ้า:", err);
    }
}

// 3. ฟังก์ชันลบสินค้า
async function deleteProduct(id) {
    if (confirm("จะลบชิ้นนี้จริงๆ ใช่ไหมลูก?")) {
        try {
            const res = await fetch(`http://localhost:8000/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("ลบเรียบร้อย!");
                loadProducts();
            }
        } catch (err) {
            alert("ลบไม่สำเร็จจ้า");
        }
    }
}

// 4. Logout
function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", loadProducts);

function editProduct(id) {
    window.location.href = `edit-product.html?id=${id}`;
}
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