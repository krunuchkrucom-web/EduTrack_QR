const API_URL = "https://script.google.com/macros/s/AKfycbwHV8K0Me5It_ePtkt4EhEnFPzypA6Rdpl-zmpU-vABr2fTeFYQGI8DZSppXSggnuPbtw/exec";
let auth = JSON.parse(localStorage.getItem('auth')) || null;
let currentSelectedRole = ""; 

// --- 1. ฟังก์ชันเลือกบทบาท (แก้ไขจุดที่กดไม่ได้) ---
function selectRole(role) {
    currentSelectedRole = role;
    // ซ่อนหน้าแรก และแสดงหน้า Login
    document.getElementById('role-view').style.setProperty('display', 'none', 'important');
    document.getElementById('login-view').style.setProperty('display', 'flex', 'important');
    
    const badge = document.getElementById('role-badge');
    if (badge) {
        badge.innerText = (role === 'Student') ? "สถานะ: นักเรียน" : "สถานะ: ผู้สอน";
        badge.className = (role === 'Student') ? "badge rounded-pill bg-info text-white px-3 py-2 shadow-sm" : "badge rounded-pill bg-warning text-dark px-3 py-2 shadow-sm";
    }
}

function backToRole() {
    document.getElementById('role-view').style.setProperty('display', 'flex', 'important');
    document.getElementById('login-view').style.setProperty('display', 'none', 'important');
}

// --- 2. ระบบ API และ Login ---
async function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (!user || !pass) {
        Swal.fire('คำเตือน', 'กรุณากรอกข้อมูลให้ครบ', 'warning');
        return;
    }
    
    // แสดง Loader
    document.getElementById('loader').style.display = 'flex';
    
    try {
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'login', user, pass }) });
        const json = await res.json();
        
        document.getElementById('loader').style.display = 'none';
        
        if (json.success) {
            if (json.role !== currentSelectedRole) {
                Swal.fire('ผิดพลาด', `บัญชีนี้ไม่ใช่สิทธิ์ ${currentSelectedRole}`, 'error');
                return;
            }
            auth = json;
            localStorage.setItem('auth', JSON.stringify(json));
            initApp();
        } else {
            Swal.fire('ล้มเหลว', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
        }
    } catch (err) {
        document.getElementById('loader').style.display = 'none';
        Swal.fire('Error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    }
}

// --- 3. เริ่มต้นแอปและ Render Dashboard ---
function initApp() {
    if (!auth) return;
    document.getElementById('role-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('main-view').style.display = 'block';

    const userDisplay = document.getElementById('user-display-name');
    if (userDisplay) {
        userDisplay.innerHTML = `<div class="fw-bold">${auth.name}</div><small class="text-muted">${auth.role}</small>`;
    }
    renderMenu();
}

function renderMenu() {
    const area = document.getElementById('content-area');
    if (auth.role === 'Teacher') {
        // โครงสร้างหน้าผู้สอนแบบในรูป (Dashboard 8:4)
        area.innerHTML = `
            <div class="row g-3 mb-4">
                <div class="col-md-4"><div class="card p-3 border-0 shadow-sm bg-light-blue rounded-4" onclick="showCreateQR()">📸 <b>สแกนเข้าเรียน</b></div></div>
                <div class="col-md-4"><div class="card p-3 border-0 shadow-sm bg-light-green rounded-4">👤 <b>เพิ่มนักเรียน</b></div></div>
                <div class="col-md-4"><div class="card p-3 border-0 shadow-sm bg-light-purple rounded-4">📊 <b>ดูรายงาน</b></div></div>
            </div>
            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card p-4 border-0 shadow-sm rounded-4">
                        <div class="d-flex justify-content-between mb-3"><h5>เลือกห้องเรียน</h5></div>
                        <div class="d-flex gap-2 mb-4">
                            <button class="btn btn-primary rounded-3 px-4" onclick="loadClassRoom('ปวช.1/1')">ปวช.1/1</button>
                            <button class="btn btn-outline-secondary rounded-3 px-4" onclick="loadClassRoom('ปวช.1/2')">ปวช.1/2</button>
                        </div>
                        <table class="table align-middle">
                            <thead class="table-light"><tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
                            <tbody id="student-list-area"></tbody>
                        </table>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card p-4 border-0 shadow-sm rounded-4 text-center">
                        <h6>สรุปภาพรวมวันนี้</h6>
                        <h2 class="text-primary fw-bold">158</h2>
                        <p class="small text-muted">คน</p>
                    </div>
                </div>
            </div>`;
        loadClassRoom('ปวช.1/1');
    } else {
        area.innerHTML = `<h4>ยินดีต้อนรับนักเรียน</h4>`;
    }
}

async function loadClassRoom(room) {
    const tbody = document.getElementById('student-list-area');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">กำลังโหลด...</td></tr>';
    // ส่วนนี้จะดึงข้อมูลจริงจาก Google Sheets
}

function logout() {
    localStorage.clear();
    location.reload();
}

window.onload = () => { if(auth) initApp(); };
