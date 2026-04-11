const API_URL = "https://script.google.com/macros/s/AKfycbwHV8K0Me5It_ePtkt4EhEnFPzypA6Rdpl-zmpU-vABr2fTeFYQGI8DZSppXSggnuPbtw/exec";
let auth = JSON.parse(localStorage.getItem('auth')) || null;
let currentSelectedRole = ""; 

async function apiCall(data) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
    try {
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(data) });
        const json = await res.json();
        if (loader) loader.style.display = 'none';
        return json;
    } catch (err) {
        if (loader) loader.style.display = 'none';
        console.error(err);
        return { success: false };
    }
}

function selectRole(role) {
    currentSelectedRole = role;
    document.getElementById('role-view').style.setProperty('display', 'none', 'important');
    document.getElementById('login-view').style.display = 'block';
    
    const badge = document.getElementById('role-badge');
    if (badge) {
        badge.innerText = (role === 'Student') ? "สถานะ: นักเรียน" : "สถานะ: ผู้สอน";
        badge.className = (role === 'Student') ? "badge rounded-pill bg-info text-white px-3 py-2 shadow-sm" : "badge rounded-pill bg-warning text-dark px-3 py-2 shadow-sm";
    }
    
    const title = document.getElementById('login-title');
    if (title) title.innerText = (role === 'Student') ? "นักเรียน Login" : "ผู้สอน Login";
}

function backToRole() {
    document.getElementById('role-view').style.setProperty('display', 'flex', 'important');
    document.getElementById('login-view').style.display = 'none';
}

async function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (!user || !pass) {
        Swal.fire('คำเตือน', 'กรุณากรอกข้อมูลให้ครบ', 'warning');
        return;
    }

    const res = await apiCall({ action: 'login', user, pass });

    if (res.success) {
        if (res.role !== currentSelectedRole) {
            Swal.fire('ผิดพลาด', `บัญชีนี้ไม่มีสิทธิ์ใช้งานในฐานะ ${currentSelectedRole}`, 'error');
            return;
        }
        auth = res;
        localStorage.setItem('auth', JSON.stringify(res));
        initApp();
    } else {
        Swal.fire('ล้มเหลว', 'Username หรือ Password ไม่ถูกต้อง', 'error');
    }
}

function initApp() {
    if (!auth) return;
    document.getElementById('role-view').style.setProperty('display', 'none', 'important');
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('main-view').style.display = 'block';
    renderMenu();
}

function renderMenu() {
    const area = document.getElementById('content-area');
    if (!area) return;
    if (auth.role === 'Student') {
        area.innerHTML = `<h3>ยินดีต้อนรับนักเรียน: ${auth.name}</h3>`;
    } else {
        area.innerHTML = `<h3>ยินดีต้อนรับคุณครู: ${auth.name}</h3>`;
    }
}

function logout() { 
    localStorage.clear(); 
    location.reload(); 
}

window.onload = initApp;
