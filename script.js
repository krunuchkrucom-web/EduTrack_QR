const API_URL = "https://script.google.com/macros/s/AKfycbwHV8K0Me5It_ePtkt4EhEnFPzypA6Rdpl-zmpU-vABr2fTeFYQGI8DZSppXSggnuPbtw/exec";
let auth = JSON.parse(localStorage.getItem('auth')) || null;
let currentSelectedRole = ""; 

// --- 1. ระบบจัดการการเรียกใช้ API ---
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

// --- 2. ระบบ Login ---
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

// --- 3. ระบบ Dashboard ---
function initApp() {
    if (!auth) return;
    document.getElementById('role-view').style.setProperty('display', 'none', 'important');
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('main-view').style.display = 'block';
    
    // ปรับ UI ตาม Role
    if (auth.role === 'Student') {
        document.getElementById('app').classList.add('student-mode');
    } else {
        document.getElementById('app').classList.remove('student-mode');
    }

    const userDisplay = document.getElementById('user-display-name');
    if(userDisplay) {
        userDisplay.innerHTML = `
            <span class="d-block fw-bold">${auth.role === 'Student' ? 'สวัสดี,' : 'ยินดีต้อนรับ'} ${auth.name}</span>
            <span class="text-muted extra-small">${auth.role === 'Student' ? 'ID: ' + auth.user : 'จัดการระบบ EduTrack QR'}</span>
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
                <div class="col-md-4">
                    <div class="card stat-card bg-grad-blue p-4 shadow-sm border-0" onclick="showCreateQR()">
                        <div class="d-flex justify-content-between align-items-center">
                            <div><h5 class="fw-bold mb-0">สแกนเข้าเรียน</h5><small>เริ่มสแกน QR Code</small></div>
                            <div class="fs-1">📸</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card stat-card bg-grad-green p-4 shadow-sm border-0">
                        <div class="d-flex justify-content-between align-items-center">
                            <div><h5 class="fw-bold mb-0">เพิ่มนักเรียน</h5><small>ลงทะเบียนใหม่</small></div>
                            <div class="fs-1">👥</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card stat-card bg-grad-purple p-4 shadow-sm border-0" onclick="showHistory()">
                        <div class="d-flex justify-content-between align-items-center">
                            <div><h5 class="fw-bold mb-0">ดูรายงาน</h5><small>สรุปมาเรียน</small></div>
                            <div class="fs-1">📊</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card border-0 rounded-4 shadow-sm p-4">
                <h5 class="fw-bold mb-3">เลือกห้องเรียน</h5>
                <div class="d-flex gap-2 flex-wrap mb-4" id="class-list-area">
                    <button class="btn btn-primary class-btn rounded-pill px-4" onclick="loadClassRoom('ปวช.1/1', this)">ปวช.1/1</button>
                    <button class="btn btn-outline-primary class-btn rounded-pill px-4" onclick="loadClassRoom('ปวช.1/2', this)">ปวช.1/2</button>
                    <button class="btn btn-outline-primary class-btn rounded-pill px-4" onclick="loadClassRoom('ปวส.2/1', this)">ปวส.2/1</button>
                </div>
                <h6 class="fw-bold text-muted mb-3">รายชื่อนักเรียน: <span id="current-class-view" class="text-primary">ปวช.1/1</span></h6>
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>USERNAME</th><th>สถานะ</th></tr>
                        </thead>
                        <tbody id="student-list-area"></tbody>
                    </table>
                </div>
            </div>`;
        const firstBtn = document.querySelector('.class-btn');
        if(firstBtn) loadClassRoom('ปวช.1/1', firstBtn);
    }
}

// --- 4. ฟังก์ชันเสริม ---
async function loadClassRoom(className, btnEl) {
    document.querySelectorAll('.class-btn').forEach(btn => btn.classList.replace('btn-primary', 'btn-outline-primary'));
    btnEl.classList.replace('btn-outline-primary', 'btn-primary');
    document.getElementById('current-class-view').innerText = className;
    const tableBody = document.getElementById('student-list-area');
    tableBody.innerHTML = '<tr><td colspan="4" class="text-center">กำลังโหลด...</td></tr>';
    
    const res = await apiCall({ action: 'getStudents', room: className });
    if (res.success && res.data) {
        tableBody.innerHTML = res.data.map(std => `
            <tr>
                <td>${std.id}</td>
                <td>${std.name}</td>
                <td><span class="badge bg-light text-dark border">${std.user}</span></td>
                <td><span class="${std.status === 'มาเรียน' ? 'text-success' : 'text-danger'}">● ${std.status}</span></td>
            </tr>`).join('');
    } else {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">ไม่พบข้อมูล</td></tr>';
    }
}

function showDashboard(el) { updateHeader("จัดการชั้นเรียน", el); renderMenu(); }
function showCreateQR(el) { updateHeader("สร้าง QR Code", el); document.getElementById('content-area').innerHTML = '<div class="card p-5 text-center shadow-sm rounded-4"><h5>ระบบสแกน QR Code</h5></div>'; }
function showHistory(el) { updateHeader("ประวัติมาเรียน", el); document.getElementById('content-area').innerHTML = '<div class="card p-5 text-center shadow-sm rounded-4"><h5>รายงานสรุป</h5></div>'; }

function updateHeader(title, el) {
    document.getElementById('header-title').innerText = title;
    if(el) {
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active', 'text-primary'));
        el.classList.add('active', 'text-primary');
    }
}

function openSubPage(title) { document.getElementById('menu-grid').style.display = 'none'; document.getElementById('sub-page-container').style.display = 'block'; document.getElementById('sub-page-title').innerText = title; }
function closeSubPage() { document.getElementById('menu-grid').style.display = 'flex'; document.getElementById('sub-page-container').style.display = 'none'; }
function showAttendanceView() { openSubPage("เช็คชื่อเข้าเรียน"); }
function showAssignmentView() { openSubPage("ส่งงาน"); }
function showReportDashboard() { openSubPage("ผลคะแนน"); }

function toggleSidebar() { document.getElementById('teacher-sidebar').classList.toggle('d-none'); }
function logout() { localStorage.clear(); location.reload(); }
window.onload = initApp;
