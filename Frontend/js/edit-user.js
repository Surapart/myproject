const API = 'http://localhost:8000';

const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = '../index.html';

// Set topbar
document.getElementById('username').textContent = `${user.FirstName} ${user.LastName}`;
const avatarEl = document.getElementById('userAvatar');
if (avatarEl) avatarEl.textContent = (user.FirstName?.[0] || '') + (user.LastName?.[0] || '');
const udName = document.getElementById('udName');
if (udName) udName.textContent = user.FirstName + ' ' + user.LastName;
const udEmail = document.getElementById('udEmail');
if (udEmail) udEmail.textContent = user.email || '';

// Fill form with current user data
document.getElementById('editId').value = user.id;
document.getElementById('editFirstName').value = user.FirstName || '';
document.getElementById('editLastName').value = user.LastName || '';
document.getElementById('editEmail').value = user.email || '';

async function saveEdit() {
    const id = document.getElementById('editId').value;
    const FirstName = document.getElementById('editFirstName').value.trim();
    const LastName = document.getElementById('editLastName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const password = document.getElementById('editPassword').value.trim();
    const errorEl = document.getElementById('editError');

    errorEl.style.display = 'none';

    if (!FirstName || !LastName || !email) {
        errorEl.textContent = 'กรุณากรอกข้อมูลให้ครบ';
        errorEl.style.display = 'block';
        return;
    }

    let finalPassword = password;
    if (!finalPassword) {
        try {
            const res = await fetch(`${API}/users/${id}`);
            const userData = await res.json();
            finalPassword = userData.password || '';
        } catch {
            errorEl.textContent = 'ไม่สามารถดึงรหัสผ่านเดิมได้';
            errorEl.style.display = 'block';
            return;
        }
    }

    try {
        const res = await fetch(`${API}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ FirstName, LastName, email, password: finalPassword })
        });

        if (!res.ok) throw new Error();

        // Update localStorage
        const updated = { ...user, FirstName, LastName, email };
        localStorage.setItem('user', JSON.stringify(updated));

        alert('แก้ไขข้อมูลสำเร็จ');
        window.history.back();
    } catch {
        errorEl.textContent = 'แก้ไขข้อมูลไม่สำเร็จ';
        errorEl.style.display = 'block';
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