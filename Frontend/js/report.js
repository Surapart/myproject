const API = 'http://localhost:8000';

// Auth
const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = '../index.html';
else {
    const el = document.getElementById('username');
    if (el) el.innerText = `${user.FirstName} ${user.LastName}`;
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.textContent = (user.FirstName?.[0] || '') + (user.LastName?.[0] || '');
    const udName = document.getElementById('udName');
    if (udName) udName.textContent = user.FirstName + ' ' + user.LastName;
    const udEmail = document.getElementById('udEmail');
    if (udEmail) udEmail.textContent = user.email || '';
}

let currentTab = 'daily';

// Set default values
const now = new Date();
document.getElementById('input-date').value = now.toISOString().slice(0, 10);
document.getElementById('input-month').value = now.getMonth() + 1;
document.getElementById('input-month-year').value = now.getFullYear();

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.report-tab').forEach((btn, i) => {
        btn.classList.toggle('active', ['daily','monthly'][i] === tab);
    });
    document.getElementById('filter-daily').style.display   = tab === 'daily'   ? 'flex' : 'none';
    document.getElementById('filter-monthly').style.display = tab === 'monthly' ? 'flex' : 'none';
    

    // Reset display
    ['totalIn','totalOut','totalTx'].forEach(id => document.getElementById(id).textContent = '-');
    document.getElementById('productTableBody').innerHTML =
        `<tr><td colspan="5" class="empty-state">เลือกช่วงเวลาแล้วกด "ดูรายงาน"</td></tr>`;
}

async function loadReport() {
    try {
        let url = '';
        if (currentTab === 'daily') {
            const date = document.getElementById('input-date').value;
            url = `${API}/reports/daily?date=${date}`;
        } else if (currentTab === 'monthly') {
            const month = document.getElementById('input-month').value;
            const year  = document.getElementById('input-month-year').value;
            url = `${API}/reports/monthly?month=${month}&year=${year}`;
        }

        const res  = await fetch(url);
        const data = await res.json();

        renderSummary(data.summary);
        renderByProduct(data.byProduct, currentTab);

    } catch (err) {
        console.error('โหลดรายงานไม่สำเร็จ:', err);
    }
}

function renderSummary(summary) {
    let totalIn = 0, totalOut = 0, totalTx = 0;
    if (Array.isArray(summary)) {
        summary.forEach(row => {
            if (row.type === 'IN') {
                totalIn  += Number(row.total_quantity);
                totalTx  += Number(row.total_transactions);
            } else if (row.type === 'OUT') {
                totalOut += Number(row.total_quantity);
                totalTx  += Number(row.total_transactions);
            }
        });
    }
    document.getElementById('totalIn').textContent  = totalIn.toLocaleString();
    document.getElementById('totalOut').textContent = totalOut.toLocaleString();
    document.getElementById('totalTx').textContent  = totalTx.toLocaleString();
}

function renderByProduct(byProduct, tab) {
    const tbody = document.getElementById('productTableBody');
    if (!Array.isArray(byProduct) || byProduct.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">ไม่มีข้อมูลในช่วงเวลานี้</td></tr>`;
        return;
    }

    if (tab === 'daily') {
        // byProduct = array of individual transactions
        tbody.innerHTML = byProduct.map(row => {
            const isIn = row.type === 'IN';
            return `<tr>
                <td style="font-weight:500; color:#333;">${row.product_name || '-'}</td>
                <td>${row.sku || '-'}</td>
                <td style="color:#059669; font-weight:600;">${isIn  ? '+' + Number(row.quantity).toLocaleString() : '-'}</td>
                <td style="color:#e74c3c; font-weight:600;">${!isIn ? '-' + Number(row.quantity).toLocaleString() : '-'}</td>
                <td style="color:#aaa; font-size:0.88rem;">${new Date(row.created_at).toLocaleString('th-TH')}</td>
            </tr>`;
        }).join('');
        // update header for daily
        document.getElementById('productTableHead').innerHTML = `
            <tr><th>ชื่อสินค้า</th><th>SKU</th><th>IN</th><th>OUT</th><th>เวลา</th></tr>`;
    } else {
        // byProduct = grouped by product
        tbody.innerHTML = byProduct.map(row => `
            <tr>
                <td style="font-weight:500; color:#333;">${row.product_name || '-'}</td>
                <td>${row.sku || '-'}</td>
                <td style="color:#059669; font-weight:600;">+${Number(row.total_in).toLocaleString()}</td>
                <td style="color:#e74c3c; font-weight:600;">-${Number(row.total_out).toLocaleString()}</td>
                <td>${Number(row.total_transactions).toLocaleString()}</td>
            </tr>`).join('');
        document.getElementById('productTableHead').innerHTML = `
            <tr><th>ชื่อสินค้า</th><th>SKU</th><th>IN รวม</th><th>OUT รวม</th><th>รายการ</th></tr>`;
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}
function toggleUserMenu() {
    const dd = document.getElementById('userDropdown');
    const chev = document.getElementById('userChev');
    dd.classList.toggle('open');
    chev.textContent = dd.classList.contains('open') ? '▲' : '▼';
}
document.addEventListener('click', function(e) {
    const pill = document.getElementById('userPill');
    if (pill && !pill.contains(e.target)) {
        document.getElementById('userDropdown').classList.remove('open');
        document.getElementById('userChev').textContent = '▼';
    }
});

// Auto-load on open
document.addEventListener('DOMContentLoaded', loadReport);