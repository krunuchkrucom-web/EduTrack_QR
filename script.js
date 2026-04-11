const API_URL = "https://script.google.com/macros/s/AKfycbwHV8K0Me5It_ePtkt4EhEnFPzypA6Rdpl-zmpU-vABr2fTeFYQGI8DZSppXSggnuPbtw/exec";
let auth = JSON.parse(localStorage.getItem('auth')) || null;
let currentSelectedRole = ""; 

// --- 1. ระบบ API ---
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
        console.error("API Error:", err);
        return { success: false };
    }
}

// --- 2. ระบบ Login ---
function selectRole(role) {
    currentSelectedRole = role;
    document.getElementById('role-view').style.setProperty('display', 'none', 'important');
    document.getElementById('login-view').style.setProperty('display', 'flex', 'important'); // ใช้ flex เพื่อให้ปุ่มอยู่กลาง
    
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
    document.getElementById('login-view').style.setProperty('display', 'none', 'important');
}

async function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (!user || !pass) {
        Swal.fire('คำเตือน', 'กรุณากรอก Username และ Password', 'warning');
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
        Swal.fire('ล้มเหลว', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
    }
}

// --- 3. ระบบแสดงผล Dashboard ---
function initApp() {
    if (!auth) return;
    
    // ซ่อนหน้าจอเลือกบทบาทและ Login
    document.getElementById('role-view').style.setProperty('display', 'none', 'important');
    document.getElementById('login-view').style.setProperty('display', 'none', 'important');
    document.getElementById('main-view').style.display = 'block';
    
    // ตั้งค่า Mode สำหรับ CSS
    if (auth.role === 'Student') {
        document.getElementById('app').classList.add('student-mode');
    } else {
        document.getElementById('app').classList.remove('student-mode');
    }

    const userDisplay = document.getElementById('user-display-name');
    if(userDisplay) {
        userDisplay.innerHTML = `
            <span class="d-block fw-bold">${auth.name}</span>
            <span class="text-muted extra-small">${auth.role === 'Teacher' ? 'Teacher' : 'Student ID: ' + auth.user}</span>
        `;
    }
    renderMenu();
}

function renderMenu() {
    const area = document.getElementById('content-area');
    if (!area) return;

    if (auth.role === 'Student') {
        area.innerHTML = `
            <div id="menu-grid" class="row g-3">
                <div class="col-6"><div class="card-menu bg-grad-blue p-4 text-center rounded-4 text-white shadow-sm" onclick="showAttendanceView()">📅 เช็คชื่อเข้าเรียน</div></div>
                <div class="col-6"><div class="card-menu bg-grad-green p-4 text-center rounded-4 text-white shadow-sm" onclick="showAssignmentView()">📝 ใบงาน & ส่งงาน</div></div>
                <div class="col-12"><div class="card-menu bg-grad-purple p-4 text-center rounded-4 text-white shadow-sm" onclick="showReportDashboard()">📊 รายงานผลคะแนน</div></div>
            </div>
            <div id="sub-page-container" style="display:none;" class="mt-3">
                <div class="d-flex justify-content-between mb-2"><h5 id="sub-page-title"></h5><button class="btn btn-sm btn-light" onclick="closeSubPage()">ปิด X</button></div>
                <div id="sub-page-content" class="p-3 bg-white rounded-4 border"></div>
            </div>`;
    } else if (auth.role === 'Teacher') {
        area.innerHTML = `
            <div class="row g-3 mb-4 text-white">
                <div class="col-md-4"><div class="card stat-card bg-grad-blue p-4 shadow-sm border-0" onclick="showCreateQR()">📸 สแกนเข้าเรียน</div></div>
                <div class="col-md-4"><div class="card stat-card bg-grad-green p-4 shadow-sm border-0">👥 เพิ่มนักเรียน</div></div>
                <div class="col-md-4"><div class="card stat-card bg-grad-purple p-4 shadow-sm border-0" onclick="showHistory()">📊 ดูรายงาน</div></div>
            </div>
            <div class="card border-0 rounded-4 shadow-sm p-4">
                <h5 class="fw-bold mb-3">เลือกห้องเรียน</h5>
                <div class="d-flex gap-2 flex-wrap mb-4">
                    <button class="btn btn-primary class-btn rounded-pill px-4" onclick="loadClassRoom('ปวช.1/1', this)">ปวช.1/1</button>
                    <button class="btn btn-outline-primary class-btn rounded-pill px-4" onclick="loadClassRoom('ปวช.1/2', this)">ปวช.1/2</button>
                    <button class="btn btn-outline-primary class-btn rounded-pill px-4" onclick="loadClassRoom('ปวส.2/1', this)">ปวส.2/1</button>
                </div>
                <h6 class="fw-bold text-muted mb-3">ห้อง: <span id="current-class-view" class="text-primary">ปวช.1/1</span></h6>
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light"><tr><th>รหัส</th><th>ชื่อ</th><th>USERNAME</th><th>สถานะ</th></tr></thead>
                        <tbody id="student-list-area"></tbody>
                    </table>
                </div>
            </div>`;
        // โหลดข้อมูลห้องแรกเป็นค่าเริ่มต้น
        const firstBtn = document.querySelector('.class-btn');
        if(firstBtn) loadClassRoom('ปวช.1/1', firstBtn);
    }
}

// --- 4. ฟังก์ชันเสริมต่างๆ ---
async function loadClassRoom(className, btnEl) {
    document.querySelectorAll('.class-btn').forEach(btn => btn.classList.replace('btn-primary', 'btn-outline-primary'));
    btnEl.classList.replace('btn-outline-primary', 'btn-primary');
    document.getElementById('current-class-view').innerText = className;
    const tableBody = document.getElementById('student-list-area');
    tableBody.innerHTML = '<tr><td colspan="4" class="text-center p-4">กำลังดึงข้อมูล...</td></tr>';
    
    const res = await apiCall({ action: 'getStudents', room: className });
    if (res.success && res.data) {
        tableBody.innerHTML = res.data.map(std => `
            <tr><td>${std.id}</td><td>${std.name}</td>
            <td><span class="badge bg-light text-dark border">${std.user}</span></td>
            <td><span class="${std.status === 'มาเรียน' ? 'text-success' : 'text-danger'}">● ${std.status}</span></td></tr>`).join('');
    } else {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-4">ไม่พบข้อมูลในห้องนี้</td></tr>';
    }
}

function showDashboard(el) { updateHeader("จัดการชั้นเรียน", el); renderMenu(); }
function showCreateQR(el) { updateHeader("สร้าง QR Code", el); document.getElementById('content-area').innerHTML = '<div class="card p-5 text-center shadow-sm"><h5>ระบบสร้าง/สแกน QR Code</h5></div>'; }
function showHistory(el) { updateHeader("ประวัติมาเรียน", el); document.getElementById('content-area').innerHTML = '<div class="card p-5 text-center shadow-sm"><h5>รายงานสรุปข้อมูล</h5></div>'; }

function updateHeader(title, el) {
    document.getElementById('header-title').innerText = title;
    if(el) {
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active', 'text-primary'));
        el.classList.add('active', 'text-primary');
    }
}

function toggleSidebar() { document.getElementById('teacher-sidebar').classList.toggle('d-none'); }
function logout() { localStorage.clear(); location.reload(); }

// รันระบบเมื่อเปิดหน้าเว็บ
window.onload = () => { if(auth) initApp(); };
