const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    window.location.href = "index.html";
} else {
    const el = document.getElementById("username");
    if (el) el.innerText = `${user.FirstName} ${user.LastName}`;
    // Set avatar initials
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.textContent = (user.FirstName?.[0] || '') + (user.LastName?.[0] || '');
    const udName = document.getElementById('udName');
    if (udName) udName.textContent = user.FirstName + ' ' + user.LastName;
    const udEmail = document.getElementById('udEmail');
    if (udEmail) udEmail.textContent = user.email || '';
}

async function loadLowStock() {
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

        const lowProducts = products.filter(p =>
            Number(p.current_stock ?? 0) <= Number(p.min_stock ?? 0)
        );

        const tbody = document.getElementById("lowstockTable");
        if (!tbody) return;

        if (lowProducts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#059669;">✅ ไม่มีสินค้าที่ใกล้หมดในขณะนี้</td></tr>`;
            return;
        }

        tbody.innerHTML = lowProducts.map(p => {
            const cur  = Number(p.current_stock ?? 0);
            const min  = Number(p.min_stock ?? 0);
            const need = min - cur;
            const cat  = catMap[p.category_id] ?? 'ทั่วไป';
            return `
                <tr>
                    <td>#${p.id}</td>
                    <td style="font-weight:500; color:#333;">${p.name || '-'}</td>
                    <td>${p.sku || '-'}</td>
                    <td>${cat}</td>
                    <td><span class="stock-badge stock-low">${cur.toLocaleString()} ชิ้น</span></td>
                    <td>${min.toLocaleString()}</td>
                    <td style="color:#e74c3c; font-weight:600;">-${need.toLocaleString()}</td>
                </tr>`;
        }).join('');

    } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", err);
    }
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", loadLowStock);
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