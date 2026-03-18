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

async function loadCategories() {
    try {
        const res = await fetch("http://localhost:8000/categories");
        const categories = await res.json();
        const sel = document.getElementById("category_id");
        categories.forEach(c => {
            sel.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
    } catch (err) {
        console.error("โหลด categories ไม่สำเร็จ:", err);
    }
}

const form = document.getElementById("addForm");
const errorBox = document.getElementById("error");

form.addEventListener("submit", async function(e) {
    e.preventDefault();
    errorBox.style.display = "none";

    const name          = document.getElementById("name").value.trim();
    const sku           = document.getElementById("sku").value.trim();
    const category_id   = Number(document.getElementById("category_id").value);
    const current_stock = Number(document.getElementById("current_stock").value);
    const min_stock     = Number(document.getElementById("min_stock").value);

    if (!name || !category_id) {
        errorBox.innerText = "กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่";
        errorBox.style.display = "block";
        return;
    }

    try {
        const res = await fetch("http://localhost:8000/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category_id, sku, min_stock, current_stock })
        });
        const data = await res.json();
        if (!res.ok) {
            errorBox.innerText = data.message || "เพิ่มสินค้าไม่สำเร็จ";
            errorBox.style.display = "block";
            return;
        }
        alert("เพิ่มสินค้าสำเร็จ!");
        window.location.href = "products.html";
    } catch (err) {
        errorBox.innerText = "ไม่สามารถเชื่อมต่อ Server";
        errorBox.style.display = "block";
    }
});

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", loadCategories);
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