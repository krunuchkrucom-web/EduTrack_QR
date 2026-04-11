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

// --- 2. ระบบ Login (คงเดิมเพื่อไม่ให้กระทบหน้าแรก) ---
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

// --- 3. ระบบ Dashboard (แสดงผลตามภาพที่ 2) ---
function initApp() {
    if (!auth) return;
    document.getElementById('role-view').style.setProperty('display', 'none', 'important');
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('main-view').style.display = 'block';
    
    const userDisplay = document.getElementById('user-display-name');
    if(userDisplay) {
        userDisplay.innerHTML = `
            <span class="d-block fw-bold">${auth.role === 'Student' ? 'สวัสดี,' : 'ยินดีต้อนรับ'} ${auth.name}</span>
            <span class="text-muted extra-small">${auth.role === 'Student' ? 'รหัสนักเรียน: ' + auth.user : 'จัดการระบบ EduTrack QR'}</span>
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
                <div class="col-6"><div class="card-menu bg-grad-blue p-4 text-center rounded-4 shadow-sm border" onclick="showAttendanceView()">📅 เช็คชื่อเข้าเรียน</div></div>
                <div class="col-6"><div class="card-menu bg-grad-green p-4 text-center rounded-4 shadow-sm border" onclick="showAssignmentView()">📝 ใบงาน & ส่งงาน</div></div>
                <div class="col-12"><div class="card-menu bg-grad-purple p-4 text-center rounded-4 shadow-sm border" onclick="showReportDashboard()">📊 รายงานผลคะแนน</div></div>
            </div>
            <div id="sub-page-container" style="display:none;" class="mt-3">
                <div class="d-flex justify-content-between mb-2"><h5 id="sub-page-title"></h5><button class="btn btn-sm btn-light" onclick="closeSubPage()">ปิด X</button></div>
                <div id="sub-page-content" class="p-3 bg-white rounded-4 border"></div>
            </div>`;
    } else if (auth.role === 'Teacher') {
        area.innerHTML = `
            <div class="row g-3 mb-4 text-white text-center">
                <div class="col-4"><div class="card stat-card bg-grad-blue shadow-sm p-3" onclick="showTeacherAttendance()">📸<br><small>สแกนชื่อ</small></div></div>
                <div class="col-4"><div class="card stat-card bg-grad-green shadow-sm p-3" onclick="showStudentManager()">👥<br><small>นักเรียน</small></div></div>
                <div class="col-4"><div class="card stat-card bg-grad-orange shadow-sm p-3" onclick="showSubjectManager()">📚<br><small>รายวิชา</small></div></div>
            </div>
            <div class="card border-0 rounded-4 shadow-sm p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold mb-0">เลือกห้องเรียน</h6>
                    <button class="btn btn-sm btn-primary rounded-pill px-3">วิทยาการคำนวณ</button>
                </div>
                <div class="row g-2 mb-3" id="class-list-area">
                    <div class="col-4"><button class="btn btn-outline-primary btn-sm w-100">ปวช1/1</button></div>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm small">
                        <thead class="table-light"><tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>สถานะ</th></tr></thead>
                        <tbody id="student-list-area"><tr><td colspan="3" class="text-center">เลือกห้องเพื่อดูรายชื่อ</td></tr></tbody>
                    </table>
                </div>
            </div>`;
    }
}

// --- 4. ฟังก์ชันจัดการ Sidebar และหน้าย่อย (Teacher Only) ---
function toggleSidebar() {
    const sidebar = document.getElementById('teacher-sidebar');
    if(sidebar) sidebar.classList.toggle('toggled');
}

// ฟังก์ชันเปลี่ยนหน้าสำหรับครู (รับพารามิเตอร์ el เพื่อไฮไลท์เมนู)
function showDashboard(el) {
    updateSidebarUI(el, "จัดการชั้นเรียน");
    renderMenu();
}

function showCreateQR(el) {
    updateSidebarUI(el, "สร้าง QR Code");
    document.getElementById('content-area').innerHTML = '<div class="card p-5 text-center shadow-sm rounded-4"><h5>เครื่องมือสร้าง QR Code สำหรับนักเรียน</h5><p class="text-muted">กำลังพัฒนาส่วนนี้...</p></div>';
}

function showHistory(el) {
    updateSidebarUI(el, "ประวัติการมาเรียน");
    document.getElementById('content-area').innerHTML = '<div class="card p-4 shadow-sm rounded-4"><h6>สรุปรายงานการมาเรียนรายเดือน</h6><hr><p>ตารางแสดงผล...</p></div>';
}

function updateSidebarUI(el, title) {
    // เปลี่ยนหัวข้อหน้า
    const brand = document.querySelector('.navbar-brand');
    if(brand) brand.innerText = title;
    
    // ไฮไลท์เมนูที่ถูกกด
    if(el) {
        document.querySelectorAll('#teacher-sidebar .nav-link').forEach(nav => {
            nav.classList.remove('active', 'text-primary');
            nav.classList.add('text-muted');
        });
        el.classList.add('active', 'text-primary');
        el.classList.remove('text-muted');
    }
}

// --- 5. ฟังก์ชันสำหรับนักเรียน ---
function openSubPage(title) {
    document.getElementById('menu-grid').style.display = 'none';
    document.getElementById('sub-page-container').style.display = 'block';
    document.getElementById('sub-page-title').innerText = title;
}

function closeSubPage() {
    document.getElementById('menu-grid').style.display = 'flex';
    document.getElementById('sub-page-container').style.display = 'none';
}

function showAttendanceView() { openSubPage("เช็คชื่อเข้าเรียน"); document.getElementById('sub-page-content').innerHTML = '<div class="text-center">กล้องสแกน QR...</div>'; }
function showAssignmentView() { openSubPage("ส่งงาน"); document.getElementById('sub-page-content').innerHTML = '<input type="file" class="form-control">'; }
function showReportDashboard() { openSubPage("ผลคะแนน"); document.getElementById('sub-page-content').innerHTML = 'คะแนนรวม: 0'; }

// ฟังก์ชันอื่นๆ
function logout() { localStorage.clear(); location.reload(); }
window.onload = initApp;
