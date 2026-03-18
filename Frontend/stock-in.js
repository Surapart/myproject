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

let products = [];

async function loadProducts() {
    try {
        const res = await fetch("http://localhost:8000/products");
        products  = await res.json();
        const sel = document.getElementById("product_id");
        const current = sel.value; // จำค่าที่เลือกอยู่
        sel.innerHTML = '<option value="">-- เลือกสินค้า --</option>';
        products.forEach(p => {
            sel.innerHTML += `<option value="${p.id}" ${p.id == current ? 'selected' : ''}>${p.name} (SKU: ${p.sku || '-'})</option>`;
        });
        // อัปเดต display ถ้ายังเลือกอยู่
        if (current) {
            const selected = products.find(p => p.id === Number(current));
            if (selected) document.getElementById("currentStockDisplay").value = `${Number(selected.current_stock).toLocaleString()} ชิ้น`;
        }
    } catch (err) {
        console.error("โหลดสินค้าไม่สำเร็จ:", err);
    }
}

const form     = document.getElementById("stockInForm");
const errorBox = document.getElementById("error");

form.addEventListener("submit", async function(e) {
    e.preventDefault();
    errorBox.style.display = "none";

    const product_id = Number(document.getElementById("product_id").value);
    const quantity   = Number(document.getElementById("quantity").value);

    if (!product_id || !quantity || quantity < 1) {
        errorBox.innerText = "กรุณาเลือกสินค้าและระบุจำนวนอย่างน้อย 1";
        errorBox.style.display = "block";
        return;
    }

    try {
        const res = await fetch("http://localhost:8000/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id, type: "IN", quantity })
        });
        const data = await res.json();
        if (!res.ok) {
            errorBox.innerText = data.message || "บันทึกไม่สำเร็จ";
            errorBox.style.display = "block";
            return;
        }
        alert(`บันทึกสินค้าเข้าสำเร็จ!\nสต็อกคงเหลือ: ${data.new_stock} ชิ้น`);
        document.getElementById("product_id").value         = "";
        document.getElementById("quantity").value           = "";
        document.getElementById("currentStockDisplay").value = "-";
        await loadProducts();
    } catch (err) {
        errorBox.innerText = "ไม่สามารถเชื่อมต่อ Server";
        errorBox.style.display = "block";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    document.getElementById("product_id").addEventListener("change", function() {
        const selected = products.find(p => p.id === Number(this.value));
        document.getElementById("currentStockDisplay").value = selected
            ? `${Number(selected.current_stock).toLocaleString()} ชิ้น`
            : '-';
    });
});

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
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