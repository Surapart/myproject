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

async function loadTransactions() {
    try {
        const [txRes, productRes] = await Promise.all([
            fetch("http://localhost:8000/transactions"),
            fetch("http://localhost:8000/products")
        ]);
        const transactions = await txRes.json();
        const products     = await productRes.json();

        const productMap = {};
        if (Array.isArray(products)) {
            products.forEach(p => { productMap[p.id] = p.name; });
        }

        const tbody = document.getElementById("txTable");
        if (!tbody) return;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:#ccc;">ยังไม่มีรายการ</td></tr>`;
            return;
        }

        // เรียงล่าสุดก่อน
        const sorted = [...transactions].reverse();

        tbody.innerHTML = sorted.map(tx => {
            const isIn    = tx.type === 'IN';
            const date    = tx.created_at
                ? new Date(tx.created_at).toLocaleString('th-TH')
                : '-';
            return `
                <tr>
                    <td>#${tx.id}</td>
                    <td style="font-weight:500; color:#333;">${productMap[tx.product_id] ?? `Product #${tx.product_id}`}</td>
                    <td>
                        <span class="stock-badge ${isIn ? 'stock-ok' : 'stock-low'}">
                            ${isIn ? '📥 IN' : '📤 OUT'}
                        </span>
                    </td>
                    <td style="font-weight:600; color:${isIn ? '#059669' : '#e74c3c'};">
                        ${isIn ? '+' : '-'}${Number(tx.quantity).toLocaleString()}
                    </td>
                    <td style="color:#aaa; font-size:0.9rem;">${date}</td>
                </tr>`;
        }).join('');

    } catch (err) {
        console.error("โหลด transactions ไม่สำเร็จ:", err);
    }
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", loadTransactions);
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