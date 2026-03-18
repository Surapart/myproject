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

let allCategories = [];

async function loadAll() {
    try {
        const [productRes, categoryRes] = await Promise.all([
            fetch("http://localhost:8000/products"),
            fetch("http://localhost:8000/categories")
        ]);
        const products   = await productRes.json();
        allCategories    = await categoryRes.json();

        const catMap = {};
        if (Array.isArray(allCategories)) {
            allCategories.forEach(c => { catMap[c.id] = c.name; });
        }

        const tbody = document.getElementById("productList");
        if (!tbody) return;

        tbody.innerHTML = products.map(p => {
            const cur = Number(p.current_stock ?? 0);
            const min = Number(p.min_stock ?? 0);
            return `
                <tr>
                    <td>#${p.id}</td>
                    <td style="font-weight:500; color:#333;">${p.name || '-'}</td>
                    <td>${p.sku || '-'}</td>
                    <td>${catMap[p.category_id] ?? 'ทั่วไป'}</td>
                    <td><span class="stock-badge ${cur <= min ? 'stock-low' : 'stock-ok'}">${cur.toLocaleString()} ชิ้น</span></td>
                    <td style="text-align:center;">
                        <button class="btn-edit" onclick="selectProduct(${p.id})">เลือก</button>
                    </td>
                </tr>`;
        }).join('');

    } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", err);
    }
}

async function selectProduct(id) {
    try {
        const res = await fetch(`http://localhost:8000/products/${id}`);
        const p   = await res.json();

        document.getElementById("editId").value           = p.id;
        document.getElementById("editName").value         = p.name || '';
        document.getElementById("editSku").value          = p.sku  || '';
        document.getElementById("editCurrentStock").value = p.current_stock ?? 0;
        document.getElementById("editMinStock").value     = p.min_stock ?? 0;

        const sel = document.getElementById("editCategoryId");
        sel.innerHTML = allCategories.map(c =>
            `<option value="${c.id}" ${c.id === p.category_id ? 'selected' : ''}>${c.name}</option>`
        ).join('');

        document.getElementById("editError").style.display = "none";
        document.getElementById("editForm").style.display  = "block";
        document.getElementById("editForm").scrollIntoView({ behavior: "smooth" });
    } catch (err) {
        alert("โหลดข้อมูลสินค้าไม่สำเร็จ");
    }
}

async function saveEdit() {
    const id            = document.getElementById("editId").value;
    const name          = document.getElementById("editName").value.trim();
    const sku           = document.getElementById("editSku").value.trim();
    const category_id   = Number(document.getElementById("editCategoryId").value);
    const current_stock = Number(document.getElementById("editCurrentStock").value);
    const min_stock     = Number(document.getElementById("editMinStock").value);
    const errorBox      = document.getElementById("editError");

    errorBox.style.display = "none";

    if (!name) {
        errorBox.innerText = "กรุณากรอกชื่อสินค้า";
        errorBox.style.display = "block";
        return;
    }

    try {
        const res = await fetch(`http://localhost:8000/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category_id, sku, min_stock, current_stock })
        });
        const data = await res.json();
        if (!res.ok) {
            errorBox.innerText = data.message || "แก้ไขไม่สำเร็จ";
            errorBox.style.display = "block";
            return;
        }
        alert("แก้ไขสินค้าสำเร็จ!");
        cancelEdit();
        await loadAll();
    } catch (err) {
        errorBox.innerText = "ไม่สามารถเชื่อมต่อ Server";
        errorBox.style.display = "block";
    }
}

function cancelEdit() {
    document.getElementById("editForm").style.display = "none";
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}


// ถ้ามี ?id= ใน URL ให้ auto-select สินค้านั้นเลย
document.addEventListener("DOMContentLoaded", async () => {
    await loadAll();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) selectProduct(Number(id));
});
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